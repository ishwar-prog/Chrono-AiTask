"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, FileText, LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
    { name: "TASKS", path: "/tasks", icon: CheckSquare },
    { name: "SCHEDULER", path: "/scheduler", icon: Calendar },
    { name: "ANALYTICS", path: "/analytics", icon: BarChart2 },
    { name: "REPORTS", path: "/reports", icon: FileText },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white border-r-2 border-border flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-[4px_0px_0px_0px_#000000]" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex flex-col justify-center px-6 border-b-2 border-border relative">
          {/* Mobile Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-1/2 -translate-y-1/2 right-4 md:hidden text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tighter uppercase relative z-10">CHRONOTASK</h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-4 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => {
                  // Close sidebar on mobile when a link is clicked
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`flex items-center space-x-3 px-4 py-3 font-bold rounded-lg border-2 border-transparent transition-all hover:bg-white hover:text-black hover:border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000000] ${
                  isActive
                    ? "border-white shadow-[inset_0_0_0_2px_#ffffff,2px_2px_0_0_#ffffff] translate-y-[-2px] !border-transparent" 
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
        <div className="p-4 border-t-2 border-border mt-auto">
          {/* User Email could go here, as in screenshot */}
          <div className="text-xs font-semibold text-white/70 mb-3 px-2 truncate">
            {/* Just a placeholder for the look from the screenshot */}
            menu actions
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 font-black uppercase text-white bg-[#e11d48] border-2 border-black hover:-translate-y-1 transition-all rounded-lg hover:shadow-[4px_4px_0_0_#000000]"
          >
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>
    </>
  );
}
