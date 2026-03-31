"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CartoonButton } from "@/components/CartoonButton";
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
  const [analyzing, setAnalyzing] = useState(false);
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
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/ai/analyze-dashboard", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
        await fetchTasks(); // refresh scores
      } else {
        alert("Failed to run AI priority logic.");
      }
    } catch (e) {
      console.error(e);
    }
    setAnalyzing(false);
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

  const doToday = tasks.filter(t => t.status !== "completed" && t.status !== "overdue" && t.priority === "High");
  const doLater = tasks.filter(t => t.status !== "completed" && t.status !== "overdue" && t.priority !== "High");
  const overdueTasksList = tasks.filter(t => t.status === "overdue");

  const userName = session?.user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-6 animate-in fade-in transition-all pb-12 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black dark:text-white">DASHBOARD</h1>
        <p className="text-gray-500 font-bold ml-1">Welcome back, {userName} 👋</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COMPLETED */}
        <div className="flex items-center p-6 bg-[#0E1514] border-2 border-[#A3E635] rounded-xl shadow-[4px_4px_0_0_#A3E635]">
          <div className="p-3 border-2 border-white rounded-xl bg-transparent flex items-center justify-center mr-4">
            <CheckSquare className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-white">{stats.completed}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#A3E635]">COMPLETED</span>
          </div>
        </div>

        {/* PENDING */}
        <div className="flex items-center p-6 bg-[#0F172A] border-2 border-[#93C5FD] rounded-xl shadow-[4px_4px_0_0_#93C5FD]">
          <div className="p-3 border-2 border-white rounded-xl bg-transparent flex items-center justify-center mr-4">
            <Clock className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-white">{stats.pending}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">PENDING</span>
          </div>
        </div>

        {/* OVERDUE */}
        <div className="flex items-center p-6 bg-[#2B0F13] border-2 border-[#FDA4AF] rounded-xl shadow-[4px_4px_0_0_#FDA4AF]">
          <div className="p-3 border-2 border-white rounded-xl bg-transparent flex items-center justify-center mr-4">
            <AlertTriangle className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-white">{stats.overdue}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FDA4AF]">OVERDUE</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Box */}
      {nextBestTask && (
        <div className="bg-[#2a1711] border-2 border-[#FFD29D] rounded-xl shadow-[4px_4px_0_0_#FFD29D] p-6 lg:px-8 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            {/* Orange Brain Icon */}
            <div className="bg-[#F97316] w-12 h-12 rounded-xl border-2 border-[#fff] shadow-[2px_2px_0_0_#000] flex items-center justify-center shrink-0">
              <Brain className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-white font-black uppercase text-xl leading-none">AI RECOMMENDATION</h2>
              <p className="text-gray-400 font-bold text-sm mb-4">Next Best Task</p>
              
              <h3 className="text-white font-black uppercase text-2xl tracking-tight mb-2 line-clamp-1">{nextBestTask.title}</h3>
              <div className="flex items-center gap-3">
                <span className="bg-[#F97316] text-white text-xs font-bold px-2 py-0.5 rounded-full lowercase shadow-sm">
                  {nextBestTask.priority}
                </span>
                {nextBestTask.deadline && (
                  <span className="text-gray-300 text-sm font-semibold">
                    Due {format(new Date(nextBestTask.deadline), "MMM d, h:mm a")}
                  </span>
                )}
                <span className="text-gray-400 text-sm font-semibold">
                  Score: {nextBestTask.aiScore?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="md:pl-8">
            <button 
              onClick={() => completeTask(nextBestTask._id)}
              className="px-8 py-3 rounded-full border-2 border-white font-black text-lg text-white bg-[#F97316] hover:bg-[#ea580c] transition-transform shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-[0_0_0_0_#fff]"
            >
              COMPLETE
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Block */}
      <div className={`bg-[#20101b] border-2 border-[#F9A8D4] rounded-xl shadow-[4px_4px_0_0_#F9A8D4] p-6 mt-4 transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Sparkles className="text-[#ec4899] w-8 h-8 shrink-0" strokeWidth={2.5} />
            <div>
              <h2 className="text-white font-black uppercase text-xl leading-none">AI ANALYSIS</h2>
              <p className="text-gray-400 font-bold text-sm">Get AI-powered priority suggestions</p>
            </div>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8 py-3 rounded-full border-2 border-white font-black text-lg text-white bg-[#ec4899] hover:bg-[#db2777] transition-transform shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-[0_0_0_0_#fff] shrink-0"
          >
            {analyzing ? "ANALYZING..." : "ANALYZE"}
          </button>
        </div>
        
        {/* Render Markdown result below inside the box if active */}
        {analysisResult && (
          <div className="mt-8 pt-6 border-t border-[#F9A8D4]/30 prose prose-invert prose-p:font-semibold prose-a:text-pink-400 prose-strong:text-pink-200 max-w-none">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Lower task grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* DO TODAY */}
        <div className="bg-[#181C25] border-2 border-[#D1D5DB] rounded-xl p-5 shadow-[4px_4px_0_0_#D1D5DB] min-h-[220px]">
          <h3 className="text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span>🔥</span> DO TODAY
          </h3>
          {doToday.length === 0 ? (
            <p className="text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {doToday.slice(0, 5).map(t => (
                <li key={t._id} className="text-white font-bold text-sm flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span> 
                  <span className="line-clamp-2">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DO LATER */}
        <div className="bg-[#181C25] border-2 border-[#D1D5DB] rounded-xl p-5 shadow-[4px_4px_0_0_#D1D5DB] min-h-[220px]">
          <h3 className="text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span>📝</span> DO LATER
          </h3>
          {doLater.length === 0 ? (
            <p className="text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {doLater.slice(0, 5).map(t => (
                <li key={t._id} className="text-white font-bold text-sm flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span> 
                  <span className="line-clamp-2">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OVERDUE */}
        <div className="bg-[#181C25] border-2 border-[#D1D5DB] rounded-xl p-5 shadow-[4px_4px_0_0_#D1D5DB] min-h-[220px]">
          <h3 className="text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
            <span className="text-[#fbbf24]">⚠️</span> OVERDUE
          </h3>
          {overdueTasksList.length === 0 ? (
            <p className="text-gray-400 font-bold text-sm">No tasks</p>
          ) : (
            <ul className="space-y-3">
              {overdueTasksList.slice(0, 5).map(t => (
                <li key={t._id} className="text-white font-bold text-sm flex items-start gap-2">
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
          <button className="px-6 py-3 rounded-xl border-2 border-white font-black text-white bg-[#0EA5E9] hover:bg-[#0284c7] transition-transform shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-[0_0_0_0_#fff] flex items-center gap-2">
            VIEW ALL TASKS <ChevronRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

    </div>
  );
}
