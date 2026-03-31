"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, FileText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
    { name: "TASKS", path: "/tasks", icon: CheckSquare },
    { name: "SCHEDULER", path: "/scheduler", icon: Calendar },
    { name: "ANALYTICS", path: "/analytics", icon: BarChart2 },
    { name: "REPORTS", path: "/reports", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-primary text-white shrink-0 border-r-2 border-border hidden md:flex flex-col">
      <div className="h-20 flex items-center justify-center border-b-2 border-border">
        <h1 className="text-2xl font-black tracking-tighter">CHRONOTASK</h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center space-x-3 px-4 py-3 font-bold rounded-lg border-2 border-transparent transition-all hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000000] ${
                isActive
                  ? "bg-white text-black border-black shadow-[4px_4px_0_0_#000000] translate-y-[-2px]"
                  : "text-white/90"
              }`}
            >
              <link.icon className="w-5 h-5" strokeWidth={2.5} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Sign Out Button */}
      <div className="p-4 border-t-2 border-border">
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 font-black uppercase text-red-400 hover:text-white border-2 border-transparent hover:border-white hover:-translate-y-1 transition-all rounded-lg hover:bg-red-500 hover:shadow-[4px_4px_0_0_#ffffff]"
        >
          <LogOut className="w-5 h-5" strokeWidth={3} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
