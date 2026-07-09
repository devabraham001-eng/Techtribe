"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

interface WriteModalContextType {
  open: boolean;
  openWriteModal: (editId?: string) => void;
  closeWriteModal: () => void;
  editId: string | null;
}

const WriteModalContext = React.createContext<WriteModalContextType | null>(null);

export function WriteModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);

  const openWriteModal = React.useCallback((id?: string) => {
    setEditId(id ?? null);
    setOpen(true);
  }, []);

  const closeWriteModal = React.useCallback(() => {
    setOpen(false);
    setEditId(null);
  }, []);

  React.useEffect(() => {
    if (editId && open) {
      router.replace(`${pathname}?id=${editId}`, { scroll: false });
    }
  }, [editId, open, router, pathname]);

  React.useEffect(() => {
    if (!open) {
      router.replace(pathname, { scroll: false });
    }
  }, [open, router, pathname]);

  return (
    <WriteModalContext.Provider value={{ open, openWriteModal, closeWriteModal, editId }}>
      {children}
    </WriteModalContext.Provider>
  );
}

export function useWriteModal() {
  const context = React.useContext(WriteModalContext);
  if (!context) throw new Error("useWriteModal must be used within WriteModalProvider");
  return context;
}
