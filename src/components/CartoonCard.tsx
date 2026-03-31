"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CartoonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function CartoonCard({
  children,
  className,
  noPadding = false,
  ...props
}: CartoonCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_#171717] dark:shadow-[4px_4px_0px_0px_#f8fafc] overflow-hidden",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
