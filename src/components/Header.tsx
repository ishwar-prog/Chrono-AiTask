"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, AlertTriangle, Hourglass, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { format } from "date-fns";

// Re-using the ITask definition minimally for typing
interface TaskType {
  _id: string;
  title: string;
  status: "pending" | "completed" | "overdue";
  deadline?: string;
  createdAt: string;
}

export function Header() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks for notifications");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <div className="flex items-center gap-1 bg-[#b91c1c] text-white text-xs font-bold px-2 py-1 rounded-full border border-[#7f1d1d] shrink-0">
            <AlertTriangle className="w-3 h-3" /> OVERDUE
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center gap-1 bg-[#15803d] text-white text-xs font-bold px-2 py-1 rounded-full border border-[#14532d] shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-gray-500/20 text-gray-300 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full border border-gray-600 shrink-0">
            <Hourglass className="w-3 h-3" /> Pending
          </div>
        );
    }
  };

  // Sort tasks to put overdue first, then pending closest to deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <header className="h-20 border-b-2 border-black dark:border-white bg-[#FCF9F1] dark:bg-slate-900 flex items-center justify-between px-8 shrink-0 relative z-50">
      <div className="flex items-center space-x-4">
        {/* Placeholder for left side elements if needed */}
      </div>
      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        
        {/* Bell Button */}
        <button 
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) fetchTasks(); // Refresh when opening
          }}
          className="relative p-2 rounded-full border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] hover:-translate-y-0.5 transition-all bg-white dark:bg-slate-800"
        >
          <Bell className="w-5 h-5 text-black dark:text-white" />
          {tasks.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black dark:border-white">
              {tasks.length}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-12 right-14 w-[360px] bg-[#1a1c29] border-2 border-black dark:border-white rounded-xl shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#ffffff] overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-black text-lg tracking-tight uppercase">Notifications</h3>
              <p className="text-gray-400 text-sm font-bold">{tasks.length} items</p>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {sortedTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-400 font-bold">No notifications yet!</div>
              ) : (
                sortedTasks.map(task => (
                  <div key={task._id} className="p-4 border-b border-gray-800/50 flex gap-3 hover:bg-white/5 transition-colors cursor-default">
                    {getStatusBadge(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{task.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {task.deadline ? format(new Date(task.deadline), "MMM d, h:mm a") : format(new Date(task.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <ThemeToggle />
        
        {/* User profile simple circle avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_#ffffff] overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer hover:-translate-y-0.5 transition-transform">
          <span className="font-bold text-black select-none">IS</span>
        </div>
      </div>
    </header>
  );
}
