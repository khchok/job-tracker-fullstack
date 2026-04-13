"use client";

import Image from "next/image";
import { useState } from "react";
import AuthorModal from "./AuthorModal";

export default function AuthorRibbon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="About the author"
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 flex items-center gap-2 bg-blue-700 text-white pl-3 pr-3 py-2.5 rounded-l-full shadow-lg hover:bg-blue-800 transition-colors cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/40 shrink-0">
          <Image
            src="/images/icons/profile.jpg"
            alt="Author"
            width={24}
            height={24}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-xs font-semibold tracking-wide">About</span>
      </button>

      <AuthorModal open={open} onOpenChange={setOpen} />
    </>
  );
}
