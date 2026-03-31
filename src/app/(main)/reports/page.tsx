"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface ITask {
  _id: string;
  title: string;
  priority: string;
  status: "pending" | "completed" | "overdue";
  createdAt: string;
  deadline?: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("Analyzing performance...");
  
  // Custom date tracking for the month selection
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/tasks");
    if (res.ok) {
      setTasks(await res.json());
    }
    setLoading(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Filter tasks to ONLY this viewing month
  const monthlyTasks = tasks.filter(t => {
    // We judge "month" based on deadline if it has one, or createdAt
    const compareDate = new Date(t.deadline || t.createdAt);
    return compareDate.getMonth() === currentDate.getMonth() && compareDate.getFullYear() === currentDate.getFullYear();
  });

  const completedCount = monthlyTasks.filter(t => t.status === "completed").length;
  const notDoneCount = monthlyTasks.filter(t => t.status === "overdue").length;
  const totalCount = monthlyTasks.length;
  const rate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  
  // Calculate artificial score out of 10
  let score = 0.0;
  if (totalCount > 0) {
    score = (rate / 10);
  }

  // Group tasks by day
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const dailyLogs = [];
  
  for (let i = daysInMonth; i >= 1; i--) {
    const dayDate = new Date(year, currentDate.getMonth(), i);
    const tasksForDay = monthlyTasks.filter(t => new Date(t.deadline || t.createdAt).getDate() === i);
    
    if (tasksForDay.length > 0) {
      dailyLogs.push({
        dateStr: `${dayDate.toLocaleString('default', { weekday: 'long' }).toUpperCase()}, ${monthName.toUpperCase()} ${i}`,
        completed: tasksForDay.filter(t => t.status === "completed"),
        notDone: tasksForDay.filter(t => t.status === "overdue" || t.status === "pending") // count pure pending as not done for logs if we are strictly grading execution
      });
    }
  }

  // Fetch the AI insight specifically after the month switches and stats calculate
  useEffect(() => {
    if (totalCount >= 0 && !loading) {
      const fetchInsight = async () => {
        setInsight("Analyzing performance...");
        const res = await fetch("/api/ai/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats: { total: totalCount, completed: completedCount, notDone: notDoneCount, rate, score: score.toFixed(1) } })
        });
        if (res.ok) {
          const data = await res.json();
          setInsight(data.insight);
        }
      };
      // only trigger insight fetch if there are tasks to look at
      if (totalCount > 0) fetchInsight();
      else setInsight("No tasks assigned for this month. Take a break!");
    }
  }, [totalCount, currentDate, loading]);


  return (
    <div className="space-y-6 animate-in fade-in transition-all pb-12 w-full max-w-5xl mx-auto px-4">
      
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b-2 border-gray-800">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span className="text-pink-500"><Calendar className="w-8 h-8" strokeWidth={2.5}/></span> REPORTS
          </h1>
          <p className="text-gray-400 font-bold ml-11">Daily logs & monthly performance</p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-3 border-2 border-gray-600 rounded-xl hover:bg-white hover:text-black transition cursor-pointer text-gray-300 shadow-[2px_2px_0_0_#4B5563]">
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="text-white font-black text-xl tracking-widest w-40 text-center uppercase">{monthName} {year}</span>
          <button onClick={handleNextMonth} className="p-3 border-2 border-gray-600 rounded-xl hover:bg-white hover:text-black transition cursor-pointer text-gray-300 shadow-[2px_2px_0_0_#4B5563]">
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* KPI Report Block */}
      <div className="bg-[#1A1A24] border-2 border-gray-600 rounded-2xl p-6 shadow-[6px_6px_0_0_#4B5563]">
        <h2 className="text-[#ec4899] font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4" /> MONTHLY PERFORMANCE — {monthName.toUpperCase()} {year}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* TOTAL */}
          <div className="bg-[#242A38] border border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center">
             <span className="text-4xl font-black text-white">{totalCount}</span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">TOTAL</span>
          </div>
          {/* COMPLETED */}
          <div className="bg-[#242A38] border border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center">
             <span className="text-4xl font-black text-[#4ADE80]">{completedCount}</span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">COMPLETED</span>
          </div>
          {/* NOT DONE */}
          <div className="bg-[#242A38] border border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center">
             <span className="text-4xl font-black text-[#F87171]">{notDoneCount}</span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">NOT DONE</span>
          </div>
          {/* RATE */}
          <div className="bg-[#242A38] border border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center">
             <span className="text-4xl font-black text-[#F97316]">{rate}%</span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">RATE</span>
          </div>
          {/* SCORE */}
          <div className="bg-[#242A38] border border-gray-700 rounded-xl py-6 flex flex-col items-center justify-center col-span-2 md:col-span-1">
             <span className="text-4xl font-black text-[#ec4899]">{score.toFixed(1)}<span className="text-gray-500 text-lg">/10</span></span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">SCORE</span>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="border border-gray-700 rounded-xl p-4 bg-[#1e2330]">
           <span className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1 mb-2">📈 INSIGHT</span>
           <p className="text-white font-semibold">{insight}</p>
        </div>
      </div>

      {/* Daily Logs Title */}
      <h2 className="text-white font-black uppercase text-xl mt-12 mb-4 flex items-center gap-2">
         <Calendar className="w-5 h-5 text-blue-400" /> DAILY LOGS
      </h2>

      {/* Daily Logs Mapping */}
      <div className="space-y-4">
        {dailyLogs.length === 0 ? (
          <div className="border border-gray-700 rounded-xl p-8 text-center bg-[#181C25] text-gray-400 font-bold">
            No logs recorded for {monthName} yet.
          </div>
        ) : (
          dailyLogs.map((log, idx) => (
            <div key={idx} className="bg-[#181C25] border-2 border-gray-600 rounded-xl p-6 shadow-[4px_4px_0_0_#4B5563]">
              <h3 className="text-white font-black uppercase tracking-wide text-sm mb-4">🗓️ {log.dateStr}</h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Completed Col */}
                <div className="flex-1">
                  <h4 className="text-[#4ADE80] font-bold text-xs flex items-center gap-1 mb-3">✅ COMPLETED ({log.completed.length})</h4>
                  {log.completed.length === 0 ? (
                    <p className="text-gray-500 text-sm font-semibold">None</p>
                  ) : (
                    <ul className="space-y-2">
                      {log.completed.map(t => (
                        <li key={t._id} className="text-white font-bold text-sm flex items-center gap-3 bg-[#1e2433] p-2 rounded">
                          <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">{t.priority}</span>
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Not Done Col */}
                <div className="flex-1">
                  <h4 className="text-[#F87171] font-bold text-xs flex items-center gap-1 mb-3">❌ NOT DONE ({log.notDone.length})</h4>
                  {log.notDone.length === 0 ? (
                    <p className="text-gray-500 text-sm font-semibold">None</p>
                  ) : (
                    <ul className="space-y-2">
                      {log.notDone.map(t => (
                        <li key={t._id} className="text-white font-bold text-sm flex items-center gap-3 bg-[#301c22] p-2 rounded">
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">{t.priority}</span>
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
