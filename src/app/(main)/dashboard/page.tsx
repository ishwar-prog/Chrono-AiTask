"use client";

import { useEffect, useState } from "react";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonButton } from "@/components/CartoonButton";
import { CartoonBadge } from "@/components/CartoonBadge";
import { Bot, Zap } from "lucide-react";
import { ITask } from "@/models/Task";

export default function Dashboard() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (res.ok) {
      setTasks(data);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const res = await fetch("/api/ai/analyze-priority", { method: "POST" });
    if (res.ok) {
      await fetchTasks();
    } else {
      alert("Failed to analyze priority.");
    }
    setAnalyzing(false);
  };

  const mapStatusCounts = () => {
    let completed = 0, pending = 0, overdue = 0;
    tasks.forEach(t => {
      if (t.status === "completed") completed++;
      else if (t.status === "overdue") overdue++;
      else pending++;
    });
    return { completed, pending, overdue };
  };

  const stats = mapStatusCounts();

  const nextBestTask = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => b.aiScore - a.aiScore)[0];

  const doToday = tasks.filter(t => t.status !== "completed" && t.status !== "overdue" && t.priority === "High");
  const doLater = tasks.filter(t => t.status !== "completed" && t.status !== "overdue" && t.priority !== "High");
  const overdueTasksList = tasks.filter(t => t.status === "overdue");

  return (
    <div className="space-y-8 animate-in fade-in transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CartoonCard className="bg-green-100 dark:bg-green-900 border-green-800 flex flex-col items-center justify-center p-6 transition-transform hover:-translate-y-1">
          <span className="text-sm font-bold uppercase text-green-800 dark:text-green-300">Completed</span>
          <span className="text-5xl font-black text-green-900 dark:text-green-100 mt-2">{stats.completed}</span>
        </CartoonCard>
        <CartoonCard className="bg-blue-100 dark:bg-blue-900 border-blue-800 flex flex-col items-center justify-center p-6 transition-transform hover:-translate-y-1">
          <span className="text-sm font-bold uppercase text-blue-800 dark:text-blue-300">Pending</span>
          <span className="text-5xl font-black text-blue-900 dark:text-blue-100 mt-2">{stats.pending}</span>
        </CartoonCard>
        <CartoonCard className="bg-red-100 dark:bg-red-900 border-red-800 flex flex-col items-center justify-center p-6 transition-transform hover:-translate-y-1">
          <span className="text-sm font-bold uppercase text-red-800 dark:text-red-300">Overdue</span>
          <span className="text-5xl font-black text-red-900 dark:text-red-100 mt-2">{stats.overdue}</span>
        </CartoonCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CartoonCard className="flex flex-col h-full bg-purple-50 dark:bg-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center border-2 border-black">
              <Bot className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Next Best Task</h2>
          </div>
          {nextBestTask ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="font-bold text-lg">{nextBestTask.title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{nextBestTask.description}</p>
                <div className="flex gap-2 mt-3">
                  <CartoonBadge variant={nextBestTask.priority === "High" ? "error" : "warning"}>
                    {nextBestTask.priority}
                  </CartoonBadge>
                  <CartoonBadge variant="info">AI Score: {nextBestTask.aiScore?.toFixed(2)}</CartoonBadge>
                </div>
              </div>
              <div className="mt-6">
                <CartoonButton label="COMPLETE" color="bg-purple-300" className="w-full" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-bold text-neutral-500">No tasks pending!</p>
            </div>
          )}
        </CartoonCard>

        <CartoonCard className="flex flex-col h-full justify-center items-center text-center">
          <Zap className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Priority Analysis</h2>
          <p className="font-bold text-neutral-600 dark:text-neutral-400 mb-6">Let our AI analyze your tasks and assign smart priority scores.</p>
          <CartoonButton 
            label={analyzing ? "ANALYZING..." : "ANALYZE NOW"} 
            color="bg-yellow-400" 
            onClick={handleAnalyze} 
            disabled={analyzing} 
            className="w-full max-w-xs"
          />
        </CartoonCard>
      </div>
      
      {/* Simple lists rendering */}
      <h2 className="text-2xl font-black uppercase mt-12 mb-4">Task Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-black bg-blue-100 dark:bg-blue-900 border-2 border-black inline-block px-3 py-1 -skew-x-6">DO TODAY</h3>
          {doToday.map(t => <div key={t._id as unknown as string} className="p-3 border-2 border-black bg-white dark:bg-slate-700 shadow-[2px_2px_0_0_#000] rounded-xl font-bold">{t.title}</div>)}
        </div>
        <div className="space-y-4">
          <h3 className="font-black bg-gray-200 dark:bg-slate-600 border-2 border-black inline-block px-3 py-1 -skew-x-6">DO LATER</h3>
          {doLater.map(t => <div key={t._id as unknown as string} className="p-3 border-2 border-black bg-white dark:bg-slate-700 shadow-[2px_2px_0_0_#000] rounded-xl font-bold">{t.title}</div>)}
        </div>
        <div className="space-y-4">
          <h3 className="font-black bg-red-200 dark:bg-red-800 border-2 border-black inline-block px-3 py-1 -skew-x-6">OVERDUE</h3>
          {overdueTasksList.map(t => <div key={t._id as unknown as string} className="p-3 border-2 border-black bg-white dark:bg-slate-700 shadow-[2px_2px_0_0_#000] rounded-xl font-bold">{t.title}</div>)}
        </div>
      </div>
    </div>
  );
}
