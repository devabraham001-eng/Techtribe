"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const sections = [
  {
    idx: 0,
    heading: "Kickstart your career with certificates",
    body: "Unlock new career paths and gain in-demand skills with certificates. Complete a certificate learning path on TechTribe to earn a shareable digital credential. No prerequisites required.",
    link: { href: "/learn", label: "Explore certificates" },
  },
  {
    idx: 1,
    heading: "Level up with skill badges",
    body: "Prove your practical, technical skills with skill badges. Complete a series of lessons, earn a badge, then share your achievements with peers and employers.",
    link: { href: "/learn", label: "Explore skill badges" },
  },
  {
    idx: 2,
    heading: "Prove your expertise with certifications",
    body: "Validate your knowledge and skills with industry-recognized certifications. Prove your ability to solve real-world challenges. The certification process involves passing a proctored exam.",
    link: { href: "/learn", label: "Explore certifications" },
  },
];

export function CredentialsAccordion() {
  const [openIdx, setOpenIdx] = React.useState(0);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Images column */}
      <div className="flex md:flex-col gap-4 md:gap-6 flex-shrink-0 md:w-44">
        {[0, 1, 2].map((idx) => {
          const sectionIdx = [1, 2, 0][idx]; // cert, badge, certif
          return (
            <div
              key={idx}
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{
                borderColor: openIdx === sectionIdx ? "#D0F201" : "#38383a",
                background: "#1c1c1e",
                opacity: openIdx === sectionIdx ? 1 : 0.5,
              }}
            >
              <Image src="/ttlg.png" alt="TechTribe" width={120} height={120} className="w-full h-auto p-4" />
            </div>
          );
        })}
      </div>

      {/* Accordion panels */}
      <div className="flex-1 space-y-4">
        {sections.map((section) => (
          <div
            key={section.idx}
            className="rounded-xl border overflow-hidden transition-all"
            style={{ borderColor: "#38383a", background: "#1c1c1e" }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === section.idx ? -1 : section.idx)}
              className="flex items-center justify-between w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
            >
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                {section.heading}
              </h3>
              <ChevronDown
                className="h-5 w-5 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "#636366",
                  transform: openIdx === section.idx ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{
                maxHeight: openIdx === section.idx ? "300px" : "0px",
                opacity: openIdx === section.idx ? 1 : 0,
              }}
            >
              <div className="px-6 pb-6 space-y-3">
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#98989d" }}>
                  {section.body}
                </p>
                <Link
                  href={section.link.href}
                  className="inline-block text-sm font-medium text-primary hover:underline"
                >
                  {section.link.label}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
