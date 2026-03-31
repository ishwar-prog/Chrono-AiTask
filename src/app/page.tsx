"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartoonButton } from "@/components/CartoonButton";
import { Sparkles, CheckSquare, BrainCircuit, Calendar, BarChart3, Zap } from "lucide-react";

export default function LandingPage() {
  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F1] dark:bg-slate-900 text-black dark:text-white font-sans selection:bg-orange-400 selection:text-white transition-colors duration-200">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b-2 border-transparent">
        <div className="text-2xl font-black tracking-tight text-[#F97316]">
          CHRONOTASK
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/login">
            <button className="px-5 py-2 rounded-full border-2 border-black dark:border-white font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] active:translate-y-0.5 active:shadow-[0px_0px_0_0_#000]">
              LOG IN
            </button>
          </Link>
          <Link href="/login">
            <button className="px-5 py-2 rounded-full border-2 border-black dark:border-white font-bold text-sm text-white bg-[#F97316] hover:bg-[#ea580c] transition-colors shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] active:translate-y-0.5 active:shadow-[0px_0px_0_0_#000]">
              SIGN UP
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* AI Powered Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-black dark:border-white text-sm font-bold bg-[#FFF0DF] dark:bg-slate-800 mb-10 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
          <Sparkles className="w-4 h-4 text-[#F97316]" />
          <span>AI-POWERED</span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-[1.1] mb-8 text-black dark:text-white">
          Manage Tasks<br />
          <span className="text-[#F97316]">Smarter</span> With AI
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Create tasks, get intelligent recommendations on what to work on next, and track your productivity — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/login">
             <button className="px-8 py-4 rounded-xl border-2 border-black dark:border-white font-black text-xl text-white bg-[#F97316] hover:bg-[#ea580c] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] tracking-wide w-full sm:w-auto">
               GET STARTED
             </button>
          </Link>
          <button 
            onClick={scrollToFeatures}
            className="px-8 py-4 rounded-xl border-2 border-black dark:border-white font-black text-xl text-white bg-[#38BDF8] hover:bg-[#0284c7] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-1 active:shadow-[0px_0px_0_0_#000] tracking-wide w-full sm:w-auto"
          >
            LEARN MORE
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-12 border-t-2 border-black/10 dark:border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="bg-[#E5F0E8] dark:bg-emerald-900 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <CheckSquare className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Task Management</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">Create, prioritize, and track tasks with deadlines and status updates.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#FFF0DF] dark:bg-orange-950 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <BrainCircuit className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">AI Recommendations</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">Smart suggestions on your next best task based on urgency and keywords.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFE9E9] dark:bg-rose-950 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <Calendar className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Smart Scheduling</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">Tasks auto-categorized into Today, Later, and Overdue groups.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#FFF4E5] dark:bg-yellow-950 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <BarChart3 className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Analytics</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">Charts and metrics to visualize your completion rate and trends.</p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#E5F0E8] dark:bg-emerald-900 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <Zap className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Real-Time Updates</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">Instant notifications when tasks are updated or priorities shift.</p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#FFF0DF] dark:bg-orange-950 border-2 border-black dark:border-white rounded-xl p-8 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 transition-transform">
            <Sparkles className="w-8 h-8 mb-6" strokeWidth={2.5} />
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">AI Priority Shift</h3>
            <p className="font-bold text-gray-700 dark:text-gray-300">AI automatically adjusts task urgency based on deadlines and context.</p>
          </div>

        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center font-bold text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} ChronoTask Clone. Built with Next.js {"&"} OpenAI.
      </footer>
    </div>
  );
}
