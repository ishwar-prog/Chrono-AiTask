"use client";

import { useState } from "react";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import { Calendar, Clock, Zap } from "lucide-react";

export default function SchedulerPage() {
  const [running, setRunning] = useState(false);
  const [schedule, setSchedule] = useState<string | null>(null);

  const handleRunScheduler = async () => {
    setRunning(true);
    // Mock AI scheduler delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSchedule("AI has optimized your day! Best time to work on High Priority tasks is 10:00 AM - 1:00 PM. Take a break at 1:30 PM. Complete minor tasks by 4:00 PM.");
    setRunning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in transition-all">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">AI Scheduler</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CartoonCard className="bg-blue-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Daily Routine</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 border-2 border-black rounded-lg font-bold">
              <span>Wake Up</span>
              <span>07:00 AM</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 border-2 border-black rounded-lg font-bold">
              <span>Work Start</span>
              <span>09:00 AM</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 border-2 border-black rounded-lg font-bold">
              <span>Work End</span>
              <span>05:00 PM</span>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button className="font-bold underline uppercase text-sm">Edit Routine</button>
          </div>
        </CartoonCard>

        <CartoonCard className="flex flex-col h-full bg-purple-100 dark:bg-purple-900 justify-center items-center text-center">
          <Calendar className="w-12 h-12 text-purple-600 dark:text-purple-300 mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-purple-900 dark:text-white">Smart Setup</h2>
          <p className="font-bold text-purple-800 dark:text-purple-200 mb-6">Create the perfect execution plan combining your routine and task priorities.</p>
          <CartoonButton 
            label={running ? "SCHEDULING..." : "🚀 RUN AI SCHEDULER"} 
            color="bg-purple-400" 
            onClick={handleRunScheduler} 
            disabled={running} 
            className="w-full max-w-sm"
          />
        </CartoonCard>
      </div>

      {schedule && (
        <CartoonCard className="bg-green-100 dark:bg-green-900 border-green-800 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-green-600 dark:text-green-300 w-6 h-6" />
            <h2 className="text-xl font-black uppercase text-green-900 dark:text-white">Optimized Schedule</h2>
          </div>
          <p className="font-bold text-green-800 dark:text-green-100">{schedule}</p>
        </CartoonCard>
      )}
    </div>
  );
}
