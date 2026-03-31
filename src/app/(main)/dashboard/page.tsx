"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Brain, CheckSquare, Clock, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "completed" | "overdue";
  priority: "High" | "Medium" | "Low";
  deadline?: string;
  aiScore: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/ai/analyze-dashboard", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
        await fetchTasks();
      } else {
        const errMsg = data.message || "AI analysis failed.";
        setAnalysisResult(`⚠️ **Error:** ${errMsg}`);
      }
    } catch (e) {
      console.error(e);
      setAnalysisResult("⚠️ **Error:** Could not reach AI service. Check your connection.");
    }
    setIsAnalyzing(false);
  };

  const completeTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) fetchTasks();
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

  // Pick highest scoring non-completed task
  const nextBestTask = [...tasks]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => b.aiScore - a.aiScore)[0];

  // Calculate < 48 hours for DO TODAY
  const now = new Date().getTime();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  const doToday = tasks.filter(t => {
    if (t.status === "completed" || t.status === "overdue") return false;
    if (!t.deadline) return false;
    const timeDiff = new Date(t.deadline).getTime() - now;
    return timeDiff >= 0 && timeDiff <= FORTY_EIGHT_HOURS;
  });

  const doLater = tasks.filter(t => {
    if (t.status === "completed" || t.status === "overdue") return false;
    if (!t.deadline) return true; // tasks without a deadline intuitively go to do later
    const timeDiff = new Date(t.deadline).getTime() - now;
    return timeDiff > FORTY_EIGHT_HOURS;
  });

  const overdueTasksList = tasks.filter(t => t.status === "overdue");

  // Format greeting — use hour-based selection to avoid hydration mismatch from Math.random()
  const userName = (session?.user as Record<string, string>)?.name || session?.user?.email?.split('@')[0] || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-in fade-in transition-all pb-12 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">DASHBOARD</h1>
        <p className="text-gray-500 font-bold ml-1">{greeting}, {userName} 🚀</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* COMPLETED */}
        <div className="flex items-center p-4 md:p-6 bg-[#E5F0E8] dark:bg-emerald-950 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 border-2 border-black dark:border-white rounded-xl bg-[#FCF9F1] dark:bg-slate-800 flex items-center justify-center mr-4 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
            <CheckSquare className="text-black dark:text-white w-7 h-7" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-black text-black dark:text-white leading-none">{stats.completed}</span>
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mt-1">COMPLETED</span>
          </div>
        </div>

        {/* PENDING */}
        <div className="flex items-center p-4 md:p-6 bg-[#E0F2FE] dark:bg-cyan-950 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 border-2 border-black dark:border-white rounded-xl bg-[#FCF9F1] dark:bg-slate-800 flex items-center justify-center mr-4 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
            <Clock className="text-black dark:text-white w-7 h-7" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-black text-black dark:text-white leading-none">{stats.pending}</span>
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mt-1">PENDING</span>
          </div>
        </div>

        {/* OVERDUE */}
        <div className="flex items-center p-4 md:p-6 bg-[#FFEBEB] dark:bg-rose-950 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 border-2 border-black dark:border-white rounded-xl bg-[#FCF9F1] dark:bg-slate-800 flex items-center justify-center mr-4 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
            <AlertTriangle className="text-black dark:text-white w-7 h-7" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-black text-black dark:text-white leading-none">{stats.overdue}</span>
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mt-1">OVERDUE</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Box */}
      {nextBestTask && (
        <div className="bg-[#FFF4E5] dark:bg-[rgb(43,23,0)] border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-5 md:p-6 lg:px-8 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
          <div className="flex items-start gap-4 flex-1">
            {/* Orange Brain Icon */}
            <div className="bg-[#F97316] w-12 h-12 rounded-xl border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] flex items-center justify-center shrink-0">
              <Brain className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-black dark:text-white font-black uppercase text-lg md:text-xl leading-none">AI RECOMMENDATION</h2>
              <p className="text-gray-600 dark:text-gray-400 font-bold text-sm mb-3">Next Best Task</p>
              
              <h3 className="text-black dark:text-white font-black uppercase text-xl md:text-2xl tracking-tight mb-2 line-clamp-1">{nextBestTask.title}</h3>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="bg-[#F97316] text-white text-xs font-bold px-2 py-0.5 rounded-full lowercase shadow-sm">
                  {nextBestTask.priority}
                </span>
                {nextBestTask.deadline && (
                  <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm font-semibold">
                    Due {format(new Date(nextBestTask.deadline), "MMM d, h:mm a")}
                  </span>
                )}
                <span className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-semibold">
                  Score: {nextBestTask.aiScore?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="md:pl-8 flex justify-end">
            <button 
              onClick={() => completeTask(nextBestTask._id)}
              className="px-6 md:px-8 py-3 w-full md:w-auto rounded-xl border-2 border-black dark:border-white font-black text-lg text-white bg-[#F97316] hover:bg-[#ea580c] transition-transform shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none"
            >
              COMPLETE
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Block */}
      <div className={`bg-[#FCE7F3] dark:bg-pink-950 border-2 border-black dark:border-white rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-5 md:p-6 mt-4 transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Sparkles className="text-[#ec4899] dark:text-[#f472b6] w-8 h-8 shrink-0" strokeWidth={2.5} />
            <div>
              <h2 className="text-black dark:text-white font-black uppercase text-lg md:text-xl leading-none">AI ANALYSIS</h2>
              <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">Get AI-powered priority suggestions</p>
            </div>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-6 md:px-8 py-3 w-full md:w-auto rounded-xl border-2 border-black dark:border-white font-black text-lg text-white bg-[#ec4899] hover:bg-[#db2777] transition-transform shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none shrink-0"
          >
            {isAnalyzing ? "ANALYZING..." : "ANALYZE"}
          </button>
        </div>
        
        {/* Render Markdown result below inside the box if active */}
        {analysisResult && (
          <div className="mt-8 pt-6 border-t border-black/20 dark:border-white/20 prose prose-slate dark:prose-invert prose-p:font-semibold max-w-none">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Lower task grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
        {/* DO TODAY */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-xl p-5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] min-h-[220px]">
          <h3 className="text-black dark:text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span>🔥</span> DO TODAY
          </h3>
          {doToday.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {doToday.slice(0, 5).map(t => (
                <li key={t._id} className="text-black dark:text-white font-bold text-sm flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span> 
                  <span className="line-clamp-2">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DO LATER */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-xl p-5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] min-h-[220px]">
          <h3 className="text-black dark:text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span>📝</span> DO LATER
          </h3>
          {doLater.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {doLater.slice(0, 5).map(t => (
                <li key={t._id} className="text-black dark:text-white font-bold text-sm flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span> 
                  <span className="line-clamp-2">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OVERDUE */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-xl p-5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] min-h-[220px]">
          <h3 className="text-black dark:text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span className="text-[#fbbf24]">⚠️</span> OVERDUE
          </h3>
          {overdueTasksList.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {overdueTasksList.slice(0, 5).map(t => (
                <li key={t._id} className="text-black dark:text-white font-bold text-sm flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span> 
                  <span className="line-clamp-2">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* VIEW ALL CTA */}
      <div className="pt-2">
        <Link href="/tasks">
          <button className="px-6 md:px-8 py-3 w-full md:w-auto justify-center rounded-xl border-2 border-black dark:border-white font-black text-white bg-[#0EA5E9] hover:bg-[#0284c7] transition-transform shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none flex items-center gap-2">
            VIEW ALL TASKS <ChevronRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

    </div>
  );
}
