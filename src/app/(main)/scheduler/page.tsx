"use client";

import { useState } from "react";
import { Settings, Edit, Rocket, Clock, Laptop, PlaySquare, Moon, Coffee, Target } from "lucide-react";

interface ScheduleBlock {
  start: string;
  end: string;
  title: string;
  duration: string;
  priority: "urgent" | "high" | "medium" | "low";
  type: "task" | "break";
}

export default function SchedulerPage() {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ start: "", end: "", title: "" });
  
  const [routine, setRoutine] = useState({
    wakeTime: "07:00",
    workStart: "09:00",
    workEnd: "17:30",
    studyStart: "19:00",
    studyEnd: "21:30",
    sleepTime: "23:30",
    breakSize: "15m",
    chunkSize: "45m"
  });

  const generateTimetable = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routine }),
      });
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule);
      } else {
        alert("Failed to build schedule. Wait and try again.");
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const priorityColor = (pri: string) => {
    switch (pri?.toLowerCase()) {
      case "urgent": return "border-red-500";
      case "high": return "border-orange-500";
      case "medium": return "border-blue-500";
      default: return "border-pink-500";
    }
  };

  const handleEdit = (idx: number, block: ScheduleBlock) => {
    setEditingIndex(idx);
    setEditForm({ start: block.start, end: block.end, title: block.title });
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...schedule];
      updated[editingIndex] = { ...updated[editingIndex], ...editForm };
      setSchedule(updated);
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in transition-all w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <span className="text-pink-500">🤖</span> AI SCHEDULER
        </h1>
        <p className="text-gray-400 font-bold ml-12">AI-optimized daily execution plan</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Pane: Routine */}
        <div className="w-full xl:w-5/12 space-y-4">
          <div className="bg-[#1A1A24] border-2 border-[#D1D5DB] rounded-2xl p-6 shadow-[6px_6px_0_0_#D1D5DB]">
            <div className="flex justify-between items-center mb-8 border-b-2 border-gray-700 pb-4">
              <h2 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> DAILY ROUTINE
              </h2>
              <button className="px-5 py-1.5 rounded-full border-2 border-white text-white font-black uppercase hover:bg-white hover:text-black hover:-translate-y-0.5 shadow-[2px_2px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all">
                EDIT
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pb-6">
              {/* Wake Up */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">🌅 Wake Up</span>
                <span className="text-2xl font-black text-white">{routine.wakeTime}</span>
              </div>
              
              {/* Work Start */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">💼 Work Start</span>
                <span className="text-2xl font-black text-white">{routine.workStart}</span>
              </div>

              {/* Work End */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">💼 Work End</span>
                <span className="text-2xl font-black text-white">{routine.workEnd}</span>
              </div>
              
              {/* Study Start */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">📚 Study Start</span>
                <span className="text-2xl font-black text-white">{routine.studyStart}</span>
              </div>
              
               {/* Study End */}
               <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">📚 Study End</span>
                <span className="text-2xl font-black text-white">{routine.studyEnd}</span>
              </div>

              {/* Sleep Time */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">😴 Sleep Time</span>
                <span className="text-2xl font-black text-white">{routine.sleepTime}</span>
              </div>

              {/* Break Length */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">🍪 Break</span>
                <span className="text-2xl font-black text-white">{routine.breakSize}</span>
              </div>
              
              {/* Chunk Length */}
              <div className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">🎯 Chunk</span>
                <span className="text-2xl font-black text-white">{routine.chunkSize}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={generateTimetable}
            disabled={loading}
            className="w-full py-5 rounded-2xl border-2 border-[#fff] font-black text-2xl text-white bg-[#E83E8C] hover:bg-[#D81B60] transition-transform shadow-[6px_6px_0_0_#D1D5DB] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#D1D5DB] active:translate-y-0 active:shadow-none flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {loading ? <Clock className="animate-spin w-8 h-8" /> : <Rocket className="w-8 h-8" strokeWidth={2.5}/>} 
             {loading ? "GENERATING..." : "RUN AI SCHEDULER"}
          </button>
        </div>

        {/* Right Pane: Timetable */}
        <div className="w-full xl:w-7/12">
          <div className="bg-[#1A1A24] border-2 border-[#D1D5DB] rounded-2xl p-6 shadow-[6px_6px_0_0_#D1D5DB] min-h-[600px]">
            <h2 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2 mb-8 border-b-2 border-gray-700 pb-4">
              <Clock className="w-5 h-5 text-gray-400" /> SMART TIMETABLE
            </h2>

            {schedule.length === 0 && !loading && (
              <div className="text-center py-20 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">Push the pink button to generate your day!</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-20 text-gray-500 animate-pulse">
                <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-[#E83E8C]" />
                <p className="font-bold text-lg text-[#E83E8C]">Synthesizing optimum blocks...</p>
              </div>
            )}

            {!loading && schedule.length > 0 && (
              <div className="space-y-4">
                {schedule.map((block, idx) => (
                  <div key={idx} className={`relative bg-[#1f2030] p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row md:items-center gap-4 border-l-4 ${priorityColor(block.priority)}`}>
                    
                    {editingIndex === idx ? (
                      <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-400 font-bold uppercase">Start</label>
                          <input type="time" value={editForm.start} onChange={e => setEditForm({...editForm, start: e.target.value})} className="bg-black text-white px-2 py-1 rounded" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-400 font-bold uppercase">End</label>
                          <input type="time" value={editForm.end} onChange={e => setEditForm({...editForm, end: e.target.value})} className="bg-black text-white px-2 py-1 rounded" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="text-xs text-gray-400 font-bold uppercase">Title</label>
                          <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="bg-black text-white px-2 py-1 rounded w-full" />
                        </div>
                        <div className="flex items-end pb-1 gap-2">
                          <button onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded">Save</button>
                          <button onClick={() => setEditingIndex(null)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Time Window */}
                        <div className="flex flex-col border-r border-gray-600 pr-6 min-w-[80px]">
                          <span className="text-[#F97316] font-black text-lg">{block.start}</span>
                          <span className="text-gray-400 font-bold text-sm">{block.end}</span>
                        </div>
                        
                        {/* Title & Detail */}
                        <div className="flex-1 flex flex-col">
                          <div className="text-white font-black uppercase text-lg flex items-center gap-2 pr-8">
                             {block.type === "break" ? "🚶" : "💻"} {block.title}
                          </div>
                          <div className="text-gray-400 text-xs font-bold flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" /> {block.duration} • <span className="lowercase">{block.priority}</span>
                          </div>
                        </div>
                        
                        <div className="absolute top-4 right-4 text-gray-500 flex gap-2">
                           <button onClick={() => handleEdit(idx, block)} className="hover:text-blue-400 transition-colors">
                             <Edit className="w-5 h-5" />
                           </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
