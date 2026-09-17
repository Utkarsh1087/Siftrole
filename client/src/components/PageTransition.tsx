"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      key={pathname}
      className={`page-transition-wrapper ${mounted ? "animate-page-in" : ""}`}
    >
      {children}
    </div>
  );
}
