"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="h-20 border-b-2 border-border bg-background flex items-center justify-between px-8 shrink-0 relative z-10">
      <div className="flex items-center space-x-4">
        {/* Placeholder for left side elements if needed */}
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative p-2 rounded-full border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] hover:-translate-y-0.5 transition-transform bg-white dark:bg-slate-800">
          <Bell className="w-5 h-5 text-black dark:text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black dark:border-white">
            3
          </span>
        </button>
        <ThemeToggle />
        
        {/* User profile simple circle avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_#ffffff] overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer hover:-translate-y-0.5 transition-transform">
          <span className="font-bold text-black select-none">IS</span>
        </div>
      </div>
    </header>
  );
}
