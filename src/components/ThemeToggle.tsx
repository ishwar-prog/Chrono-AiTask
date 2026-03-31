"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 border-2 border-neutral-800 dark:border-white rounded-full bg-white dark:bg-slate-800 shadow-[2px_2px_0px_0px_#262626] dark:shadow-[2px_2px_0px_0px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 text-blue-300" />
      ) : (
        <Sun className="w-5 h-5 text-orange-500" />
      )}
    </button>
  );
}
