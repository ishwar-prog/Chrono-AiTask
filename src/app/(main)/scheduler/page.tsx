"use client";

import { useState } from "react";
import { Settings, Edit, Rocket, Clock, Target, Trash2, X, Check } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  // Editing state for individual timetable blocks
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ start: "", end: "", title: "" });

  // Editing state for daily routine
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [routine, setRoutine] = useState({
    wakeTime: "07:00",
    workStart: "09:00",
    workEnd: "17:30",
    studyStart: "19:00",
    studyEnd: "21:30",
    sleepTime: "23:30",
    breakSize: "15m",
    chunkSize: "45m",
  });
  const [routineDraft, setRoutineDraft] = useState({ ...routine });

  const generateTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routine }),
      });
      const data = await res.json();
      if (res.ok) {
        setSchedule(data.schedule || []);
      } else {
        setError(data.message || "Failed to generate schedule. Try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please check your connection.");
    }
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

  // --- Timetable block editing ---
  const handleEditBlock = (idx: number, block: ScheduleBlock) => {
    setEditingIndex(idx);
    setEditForm({ start: block.start, end: block.end, title: block.title });
  };

  const saveBlockEdit = () => {
    if (editingIndex !== null) {
      const updated = [...schedule];
      updated[editingIndex] = { ...updated[editingIndex], ...editForm };
      setSchedule(updated);
      setEditingIndex(null);
    }
  };

  const deleteBlock = (idx: number) => {
    setSchedule(schedule.filter((_, i) => i !== idx));
  };

  // --- Routine editing ---
  const startEditRoutine = () => {
    setRoutineDraft({ ...routine });
    setIsEditingRoutine(true);
  };

  const saveRoutine = () => {
    setRoutine({ ...routineDraft });
    setIsEditingRoutine(false);
  };

  const cancelRoutineEdit = () => {
    setIsEditingRoutine(false);
  };

  const routineFields = [
    { key: "wakeTime", label: "🌅 Wake Up", type: "time" },
    { key: "workStart", label: "💼 Work Start", type: "time" },
    { key: "workEnd", label: "💼 Work End", type: "time" },
    { key: "studyStart", label: "📚 Study Start", type: "time" },
    { key: "studyEnd", label: "📚 Study End", type: "time" },
    { key: "sleepTime", label: "😴 Sleep Time", type: "time" },
    { key: "breakSize", label: "🍪 Break", type: "text" },
    { key: "chunkSize", label: "🎯 Chunk", type: "text" },
  ] as const;

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
              {isEditingRoutine ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveRoutine}
                    className="px-4 py-1.5 rounded-full border-2 border-green-500 text-green-400 font-black uppercase hover:bg-green-500 hover:text-black transition-all text-sm"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={cancelRoutineEdit}
                    className="px-4 py-1.5 rounded-full border-2 border-red-500 text-red-400 font-black uppercase hover:bg-red-500 hover:text-white transition-all text-sm"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditRoutine}
                  className="px-5 py-1.5 rounded-full border-2 border-white text-white font-black uppercase hover:bg-white hover:text-black hover:-translate-y-0.5 shadow-[2px_2px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all"
                >
                  EDIT
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6">
              {routineFields.map((field) => (
                <div
                  key={field.key}
                  className="bg-[#101018] p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-gray-400 text-xs font-bold uppercase mb-2">
                    {field.label}
                  </span>
                  {isEditingRoutine ? (
                    <input
                      type={field.type}
                      value={routineDraft[field.key]}
                      onChange={(e) =>
                        setRoutineDraft({ ...routineDraft, [field.key]: e.target.value })
                      }
                      className="bg-black text-white text-center text-xl font-black px-2 py-1 rounded border border-gray-600 w-full max-w-[120px] focus:border-pink-500 outline-none"
                    />
                  ) : (
                    <span className="text-2xl font-black text-white">{routine[field.key]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateTimetable}
            disabled={loading}
            className="w-full py-5 rounded-2xl border-2 border-white font-black text-2xl text-white bg-[#E83E8C] hover:bg-[#D81B60] transition-transform shadow-[6px_6px_0_0_#D1D5DB] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#D1D5DB] active:translate-y-0 active:shadow-none flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Clock className="animate-spin w-8 h-8" />
            ) : (
              <Rocket className="w-8 h-8" strokeWidth={2.5} />
            )}
            {loading ? "GENERATING..." : "RUN AI SCHEDULER"}
          </button>
        </div>

        {/* Right Pane: Timetable */}
        <div className="w-full xl:w-7/12">
          <div className="bg-[#1A1A24] border-2 border-[#D1D5DB] rounded-2xl p-6 shadow-[6px_6px_0_0_#D1D5DB] min-h-[600px]">
            <h2 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2 mb-8 border-b-2 border-gray-700 pb-4">
              <Clock className="w-5 h-5 text-gray-400" /> SMART TIMETABLE
            </h2>

            {/* Error message */}
            {error && !loading && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-xl">
                <p className="text-red-400 font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {schedule.length === 0 && !loading && !error && (
              <div className="text-center py-20 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">Push the pink button to generate your day!</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="text-center py-20 text-gray-500 animate-pulse">
                <Clock className="w-16 h-16 mx-auto mb-4 animate-spin text-[#E83E8C]" />
                <p className="font-bold text-lg text-[#E83E8C]">
                  Synthesizing optimum blocks...
                </p>
              </div>
            )}

            {/* Schedule blocks */}
            {!loading && schedule.length > 0 && (
              <div className="space-y-4">
                {schedule.map((block, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-[#1f2030] p-4 rounded-xl border border-gray-700 border-l-4 ${priorityColor(block.priority)}`}
                  >
                    {editingIndex === idx ? (
                      /* ---- EDIT MODE ---- */
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">
                              Start
                            </label>
                            <input
                              type="time"
                              value={editForm.start}
                              onChange={(e) =>
                                setEditForm({ ...editForm, start: e.target.value })
                              }
                              className="bg-black text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">
                              End
                            </label>
                            <input
                              type="time"
                              value={editForm.end}
                              onChange={(e) =>
                                setEditForm({ ...editForm, end: e.target.value })
                              }
                              className="bg-black text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">
                              Title
                            </label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm({ ...editForm, title: e.target.value })
                              }
                              className="bg-black text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveBlockEdit}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ---- VIEW MODE ---- */
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Time Window */}
                        <div className="flex flex-col border-r border-gray-600 pr-6 min-w-[80px]">
                          <span className="text-[#F97316] font-black text-lg">
                            {block.start}
                          </span>
                          <span className="text-gray-400 font-bold text-sm">{block.end}</span>
                        </div>

                        {/* Title & Detail */}
                        <div className="flex-1 flex flex-col pr-20">
                          <div className="text-white font-black uppercase text-lg flex items-center gap-2">
                            {block.type === "break" ? "🚶" : "💻"} {block.title}
                          </div>
                          <div className="text-gray-400 text-xs font-bold flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" /> {block.duration} •{" "}
                            <span className="lowercase">{block.priority}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute top-4 right-4 flex gap-3">
                          <button
                            onClick={() => handleEditBlock(idx, block)}
                            className="text-gray-500 hover:text-blue-400 transition-colors"
                            title="Edit block"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteBlock(idx)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete block"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
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
