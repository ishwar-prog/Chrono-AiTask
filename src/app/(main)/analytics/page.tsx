"use client";

import { CartoonCard } from "@/components/CartoonCard";
import { BarChart, Bot } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in transition-all">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Analytics & Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CartoonCard className="flex flex-col justify-center items-center p-6 bg-pink-100 dark:bg-pink-900">
          <span className="text-sm font-bold uppercase text-pink-800 dark:text-pink-200">Total Tasks</span>
          <span className="text-5xl font-black text-pink-900 dark:text-white mt-2">124</span>
        </CartoonCard>
        <CartoonCard className="flex flex-col justify-center items-center p-6 bg-cyan-100 dark:bg-cyan-900">
          <span className="text-sm font-bold uppercase text-cyan-800 dark:text-cyan-200">Completion Rate</span>
          <span className="text-5xl font-black text-cyan-900 dark:text-white mt-2">82%</span>
        </CartoonCard>
        <CartoonCard className="flex flex-col justify-center items-center p-6 bg-yellow-100 dark:bg-yellow-900">
          <span className="text-sm font-bold uppercase text-yellow-800 dark:text-yellow-200">Avg AI Score</span>
          <span className="text-5xl font-black text-yellow-900 dark:text-white mt-2">0.76</span>
        </CartoonCard>
      </div>

      <CartoonCard className="bg-white dark:bg-slate-800 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="w-8 h-8 text-black dark:text-white" />
          <h2 className="text-2xl font-black uppercase tracking-tight">Performance Chart</h2>
        </div>
        <div className="h-64 w-full border-2 border-black flex items-end justify-between p-4 bg-gray-50 dark:bg-slate-900 gap-2">
          {/* Mock bar chart */}
          {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
            <div 
              key={i} 
              className="w-full bg-orange-400 border-2 border-black" 
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </CartoonCard>

      <CartoonCard className="bg-indigo-50 dark:bg-indigo-900 mt-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-indigo-900 dark:text-white">AI Insights</h2>
        </div>
        <p className="font-bold text-lg text-indigo-800 dark:text-indigo-100 relative z-10">
          "Your efficiency has increased by 15% this week! You are consistently knocking out High Priority tasks before 2 PM. Keep up the momentum on your DO LATER backlog to improve your overal AI Score."
        </p>
      </CartoonCard>
    </div>
  );
}
