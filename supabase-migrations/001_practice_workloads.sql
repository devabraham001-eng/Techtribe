-- =============================================
-- Practice Workloads (Praxicraft-style)
-- Run in Supabase SQL Editor for existing databases
-- =============================================

-- Workload categories enum
create type workload_category as enum ('javascript', 'python', 'linux', 'sql', 'web');
create type workload_difficulty as enum ('beginner', 'intermediate', 'advanced');

-- Workloads table
create table if not exists workloads (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  brief text not null,
  category workload_category not null,
  difficulty workload_difficulty not null default 'beginner',
  xp_reward int not null default 100,
  starter_files jsonb not null default '[]'::jsonb,
  hidden_tests jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- User workload submissions
create table if not exists user_workload_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workload_id uuid not null references workloads(id) on delete cascade,
  files jsonb not null default '[]'::jsonb,
  passed boolean not null default false,
  test_results jsonb,
  output text,
  submitted_at timestamptz default now()
);

-- User XP tracking
create table if not exists user_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp int not null default 0,
  level int not null default 1,
  streak_days int not null default 0,
  last_active_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_workloads_category on workloads(category);
create index if not exists idx_workloads_active on workloads(is_active) where is_active = true;
create index if not exists idx_user_workload_submissions_user on user_workload_submissions(user_id);
create index if not exists idx_user_workload_submissions_workload on user_workload_submissions(workload_id);
create index if not exists idx_user_xp_total on user_xp(total_xp desc);

-- RLS
alter table workloads enable row level security;
alter table user_workload_submissions enable row level security;
alter table user_xp enable row level security;

-- Public read active workloads
drop policy if exists "Public read active workloads" on workloads;
create policy "Public read active workloads" on workloads
  for select using (is_active = true);

-- Admins manage workloads
drop policy if exists "Admins manage workloads" on workloads;
create policy "Admins manage workloads" on workloads
  for all using (
    exists (select 1 from authors where authors.user_id = auth.uid() and authors.is_staff = true)
  )
  with check (
    exists (select 1 from authors where authors.user_id = auth.uid() and authors.is_staff = true)
  );

-- Users read own submissions
drop policy if exists "Users read own workload submissions" on user_workload_submissions;
create policy "Users read own workload submissions" on user_workload_submissions
  for select using (user_id = auth.uid());

-- Users insert own submissions
drop policy if exists "Users insert own workload submissions" on user_workload_submissions;
create policy "Users insert own workload submissions" on user_workload_submissions
  for insert with check (user_id = auth.uid());

-- Users read own XP
drop policy if exists "Users read own xp" on user_xp;
create policy "Users read own xp" on user_xp
  for select using (user_id = auth.uid());

-- Users insert/update own XP (upsert)
drop policy if exists "Users upsert own xp" on user_xp;
create policy "Users upsert own xp" on user_xp
  for insert with check (user_id = auth.uid());

drop policy if exists "Users update own xp" on user_xp;
create policy "Users update own xp" on user_xp
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Public read XP for leaderboards
drop policy if exists "Public read xp leaderboard" on user_xp;
create policy "Public read xp leaderboard" on user_xp
  for select using (true);

-- Function to award XP idempotently
create or replace function award_workload_xp(
  p_user_id uuid,
  p_xp int
)
returns void
language plpgsql
as $$
declare
  v_today date := current_date;
begin
  insert into user_xp (user_id, total_xp, level, streak_days, last_active_date)
  values (p_user_id, p_xp, 1, 1, v_today)
  on conflict (user_id) do update set
    total_xp = user_xp.total_xp + p_xp,
    level = GREATEST(1, (user_xp.total_xp + p_xp) / 1000 + 1),
    streak_days = case
      when user_xp.last_active_date = v_today then user_xp.streak_days
      when user_xp.last_active_date = v_today - interval '1 day' then user_xp.streak_days + 1
      else 1
    end,
    last_active_date = v_today,
    updated_at = now();
end;
$$;

-- Seed: beginner workloads across 4 tracks
-- JavaScript
insert into workloads (title, brief, category, difficulty, xp_reward, starter_files, hidden_tests, sort_order) values
(
  'Count Vowels',
  'Write a function `countVowels(str)` that returns the number of vowels (a, e, i, o, u) in the given string. Ignore case.',
  'javascript', 'beginner', 100,
  '[{"name":"main.js","content":"function countVowels(str) {\n  // Your code here\n}\n\nconsole.log(countVowels(\"hello world\")) // 3\n"}]'::jsonb,
  '[{"name":"countVowels(\"hello\") === 2","passed":false,"output":""},{"name":"countVowels(\"AEIOU\") === 5","passed":false,"output":""},{"name":"countVowels(\"\") === 0","passed":false,"output":""}]'::jsonb,
  1
),
(
  'Reverse String',
  'Write a function `reverseStr(str)` that returns the string reversed.',
  'javascript', 'beginner', 100,
  '[{"name":"main.js","content":"function reverseStr(str) {\n  // Your code here\n}\n\nconsole.log(reverseStr(\"abc\")) // \"cba\"\n"}]'::jsonb,
  '[{"name":"reverseStr(\"abc\") === \"cba\"","passed":false,"output":""},{"name":"reverseStr(\"hello\") === \"olleh\"","passed":false,"output":""}]'::jsonb,
  2
),
(
  'FizzBuzz',
  'Write a function `fizzBuzz(n)` that returns an array from 1 to n. For multiples of 3 use "Fizz", multiples of 5 use "Buzz", multiples of both use "FizzBuzz", otherwise the number.',
  'javascript', 'beginner', 150,
  '[{"name":"main.js","content":"function fizzBuzz(n) {\n  // Your code here\n}\n\nconsole.log(fizzBuzz(5)) // [1,2,\"Fizz\",4,\"Buzz\"]\n"}]'::jsonb,
  '[{"name":"fizzBuzz(3) === [1, 2, \"Fizz\"]","passed":false,"output":""},{"name":"fizzBuzz(5) === [1, 2, \"Fizz\", 4, \"Buzz\"]","passed":false,"output":""}]'::jsonb,
  3
);

-- Python
insert into workloads (title, brief, category, difficulty, xp_reward, starter_files, hidden_tests, sort_order) values
(
  'Count Error Lines',
  'Write a function `count_errors(log_text)` that counts lines containing "ERROR" (case-insensitive) in a multi-line log string.',
  'python', 'beginner', 100,
  '[{"name":"main.py","content":"def count_errors(log_text):\n    # Your code here\n    pass\n\nlog = \"INFO: started\\nERROR: timeout\\nDEBUG: ok\\nERROR: crash\"\nprint(count_errors(log)) # 2\n"}]'::jsonb,
  '[{"name":"count_errors(\"ERROR\\nok\\nERROR\") == 2","passed":false,"output":""},{"name":"count_errors(\"\") == 0","passed":false,"output":""},{"name":"count_errors(\"error\") == 1","passed":false,"output":""}]'::jsonb,
  1
),
(
  'Sum Even Numbers',
  'Write a function `sum_even(nums)` that returns the sum of all even numbers in a list.',
  'python', 'beginner', 100,
  '[{"name":"main.py","content":"def sum_even(nums):\n    # Your code here\n    pass\n\nprint(sum_even([1,2,3,4,5,6])) # 12\n"}]'::jsonb,
  '[{"name":"sum_even([1,2,3,4]) == 6","passed":false,"output":""},{"name":"sum_even([1,3,5]) == 0","passed":false,"output":""}]'::jsonb,
  2
),
(
  'Parse CSV Data',
  'Write a function `parse_csv(text)` that takes CSV text (comma-separated) and returns a list of dictionaries with headers as keys.',
  'python', 'intermediate', 200,
  '[{"name":"main.py","content":"def parse_csv(text):\n    # Your code here\n    pass\n\ncsv = \"name,age\\nAlice,30\\nBob,25\"\nprint(parse_csv(csv))\n# [{\"name\":\"Alice\",\"age\":\"30\"},{\"name\":\"Bob\",\"age\":\"25\"}]\n"}]'::jsonb,
  '[{"name":"parse_csv(\"name,age\\nAlice,30\") == [{\"name\": \"Alice\", \"age\": \"30\"}]","passed":false,"output":""},{"name":"parse_csv(\"\") == []","passed":false,"output":""}]'::jsonb,
  3
);

-- Linux / Bash
insert into workloads (title, brief, category, difficulty, xp_reward, starter_files, hidden_tests, sort_order) values
(
  'Find ERROR in Logs',
  'Given a file `server.log`, write a bash one-liner that counts the number of lines containing "ERROR".',
  'linux', 'beginner', 100,
  '[{"name":"server.log","content":"2026-01-15 INFO Service started\n2026-01-15 ERROR Connection refused\n2026-01-15 DEBUG Processing request\n2026-01-15 ERROR Timeout\n2026-01-15 INFO Request complete\n"}]'::jsonb,
  '[{"name":"counts ERROR lines correctly","passed":false,"output":"2"}]'::jsonb,
  1
),
(
  'Extract Unique IPs',
  'Given `access.log`, write a bash command to extract all unique IP addresses, one per line, sorted.',
  'linux', 'beginner', 100,
  '[{"name":"access.log","content":"192.168.1.1 - GET /home\n10.0.0.2 - GET /api\n192.168.1.1 - GET /about\n10.0.0.3 - POST /api\n10.0.0.2 - GET /home\n"}]'::jsonb,
  '[{"name":"finds 192.168.1.1","passed":false,"output":"192.168.1.1"},{"name":"finds 10.0.0.2","passed":false,"output":"10.0.0.2"},{"name":"finds 10.0.0.3","passed":false,"output":"10.0.0.3"}]'::jsonb,
  2
),
(
  'Sort and Count',
  'Given `words.txt` (one word per line), write a command to count occurrences of each word and sort by frequency descending.',
  'linux', 'intermediate', 200,
  '[{"name":"words.txt","content":"apple\nbanana\napple\ncherry\nbanana\napple\n"}]'::jsonb,
  '[{"name":"apple appears 3 times","passed":false,"output":"3 apple"},{"name":"banana appears 2 times","passed":false,"output":"2 banana"},{"name":"cherry appears once","passed":false,"output":"1 cherry"}]'::jsonb,
  3
);

-- SQL
insert into workloads (title, brief, category, difficulty, xp_reward, starter_files, hidden_tests, sort_order) values
(
  'Select All Users',
  'Write a SQL query to select all columns from the `users` table.',
  'sql', 'beginner', 100,
  '[{"name":"schema.sql","content":"CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), age INT)\nINSERT INTO users VALUES (1, ''Alice'', ''alice@test.com'', 30)\nINSERT INTO users VALUES (2, ''Bob'', ''bob@test.com'', 25)\nINSERT INTO users VALUES (3, ''Charlie'', ''charlie@test.com'', 35)\n"},{"name":"query.sql","content":"-- Write your query here\nSELECT * FROM users\n"}]'::jsonb,
  '[{"name":"returns Alice","passed":false,"output":"Alice"},{"name":"returns Bob","passed":false,"output":"Bob"},{"name":"returns Charlie","passed":false,"output":"Charlie"}]'::jsonb,
  1
),
(
  'Filter by Age',
  'Write a SQL query to select name and email of users older than 28, ordered by age descending.',
  'sql', 'beginner', 150,
  '[{"name":"schema.sql","content":"CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), age INT)\nINSERT INTO users VALUES (1, ''Alice'', ''alice@test.com'', 30)\nINSERT INTO users VALUES (2, ''Bob'', ''bob@test.com'', 25)\nINSERT INTO users VALUES (3, ''Charlie'', ''charlie@test.com'', 35)\n"},{"name":"query.sql","content":"-- Write your query here\n"}]'::jsonb,
  '[{"name":"returns Alice","passed":false,"output":"Alice"},{"name":"returns Charlie","passed":false,"output":"Charlie"}]'::jsonb,
  2
),
(
  'Count by Category',
  'Given a `products` table (id, name, category, price), write a query to count products per category, showing category and count, ordered by count descending.',
  'sql', 'intermediate', 200,
  '[{"name":"schema.sql","content":"CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(100), category VARCHAR(50), price DECIMAL(10,2))\nINSERT INTO products VALUES (1, ''Laptop'', ''electronics'', 999.99)\nINSERT INTO products VALUES (2, ''Mouse'', ''electronics'', 29.99)\nINSERT INTO products VALUES (3, ''Desk'', ''furniture'', 199.99)\nINSERT INTO products VALUES (4, ''Chair'', ''furniture'', 149.99)\nINSERT INTO products VALUES (5, ''Keyboard'', ''electronics'', 79.99)\n"},{"name":"query.sql","content":"-- Write your query here\n"}]'::jsonb,
  '[{"name":"electronics count is 3","passed":false,"output":"electronics"},{"name":"furniture count is 2","passed":false,"output":"furniture"}]'::jsonb,
  3
);
