"use client";

import { cn } from "@/lib/utils";

interface CartoonBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function CartoonBadge({
  children,
  className,
  variant = "default",
  ...props
}: CartoonBadgeProps) {
  const variants = {
    default: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    success: "bg-green-300 text-green-900 dark:bg-green-600 dark:text-green-50",
    warning: "bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-50",
    error: "bg-red-400 text-red-900 dark:bg-red-600 dark:text-red-50",
    info: "bg-blue-300 text-blue-900 dark:bg-blue-600 dark:text-blue-50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border-2 border-neutral-900 dark:border-white shadow-[2px_2px_0px_0px_#171717] dark:shadow-[2px_2px_0px_0px_#f8fafc]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
