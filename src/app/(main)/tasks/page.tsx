"use client";

import { useState, useEffect } from "react";
import { CartoonButton } from "@/components/CartoonButton";
import { CartoonCard } from "@/components/CartoonCard";
import { Check, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "pending" | "completed" | "overdue";
  deadline?: string;
  recurrence: "none" | "daily" | "weekdays";
  aiScore: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ITask["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [recurrence, setRecurrence] = useState<ITask["recurrence"]>("none");

  // Filter State
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"All" | ITask["priority"]>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | ITask["status"]>("All");

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (res.ok) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        description, 
        priority,
        deadline: deadline || undefined,
        recurrence
      }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDeadline("");
      setRecurrence("none");
      setIsModalOpen(false);
      fetchTasks();
    }
  };

  const completeTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in transition-all pb-12 w-full max-w-6xl mx-auto md:px-4">
      <div className="flex justify-between items-center border-b-2 border-black/10 dark:border-white/10 pb-4">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black dark:text-white">Tasks</h1>
        <CartoonButton 
          label="+ NEW TASK" 
          color="bg-[#d946ef] dark:bg-[#c026d3]" 
          onClick={() => setIsModalOpen(true)} 
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 bg-[#FCF9F1] dark:bg-slate-800 p-4 md:p-5 rounded-2xl border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-3.5 text-gray-500 dark:text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-900 border-2 border-black dark:border-white rounded-xl text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-all" 
          />
        </div>
        <div className="md:col-span-3">
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-2 border-black dark:border-white rounded-xl text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-all cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full h-12 px-4 bg-white dark:bg-slate-900 border-2 border-black dark:border-white rounded-xl text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="font-bold text-black dark:text-white">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTasks.map((task) => (
            <CartoonCard key={task._id} className="flex flex-col justify-between bg-[#FCF9F1] dark:bg-slate-800 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] text-black dark:text-white transition-transform hover:-translate-y-1">
              <div>
                <h3 className="font-black text-lg md:text-xl mb-1 truncate text-black dark:text-white">{task.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`border-2 border-black dark:border-white text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded-full shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] ${task.priority === "Urgent" ? "bg-red-400 text-black" : task.priority === "High" ? "bg-orange-400 text-black" : task.priority === "Medium" ? "bg-yellow-400 text-black" : "bg-green-400 text-black"}`}>
                    {task.priority}
                  </span>
                  <span className="border-2 border-black dark:border-white bg-[#0ea5e9] text-black text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded-full shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                    {task.recurrence === "daily" ? "🔁 Everyday" : task.recurrence === "weekdays" ? "🔁 Mon-Fri" : "📌 Onetime"}
                  </span>
                  {task.deadline && (
                    <span className="border-2 border-black dark:border-white bg-white dark:bg-slate-600 text-black dark:text-white text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded-full shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                      {format(new Date(task.deadline), "MMM dd, h:mm a")}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-black/20 dark:border-white/20">
                <span className={`text-[10px] md:text-xs font-black uppercase px-2 py-1 rounded border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] ${task.status === "completed" ? "bg-[#4ADE80] text-black" : task.status === "overdue" ? "bg-[#F87171] text-black" : "bg-[#F97316] text-black"}`}>
                  {task.status}
                </span>

                <div className="flex items-center justify-end gap-2 md:gap-3">
                  {task.status !== "completed" && (
                     <button 
                      onClick={() => completeTask(task._id)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#A3E635] border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] active:translate-y-0 active:shadow-none transition-all"
                      aria-label="Complete"
                    >
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-black" strokeWidth={3} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task._id)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#FDA4AF] border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] active:translate-y-0 active:shadow-none transition-all"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-black" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </CartoonCard>
          ))}
          
          {filteredTasks.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 font-bold text-base md:text-lg border-2 border-dashed border-black/20 dark:border-white/20 rounded-2xl bg-[#FCF9F1] dark:bg-slate-800">
               No tasks found matching constraints. Let&apos;s create one!
             </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] animate-in zoom-in-95 p-5 md:p-6">
            <h2 className="text-2xl font-black mb-6 uppercase text-black dark:text-white border-b-2 border-black/10 dark:border-white/10 pb-4">CREATE TASK</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4 md:space-y-5">
              
              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white text-[10px] md:text-sm uppercase tracking-wide">TITLE <span className="text-[#ec4899]">*</span></label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="What needs to be done?"
                  className="w-full h-12 px-4 shadow-[2px_2px_0_0_#ec4899] border-2 border-[#ec4899] font-bold focus:outline-none focus:ring-0 rounded-xl text-black bg-white dark:bg-slate-900 dark:text-white transition-shadow"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white text-[10px] md:text-sm uppercase tracking-wide">DESCRIPTION</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Add details..."
                  className="w-full p-4 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] font-bold focus:outline-none rounded-xl text-black dark:text-white bg-white dark:bg-slate-900 resize-none transition-shadow"
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white text-[10px] md:text-sm uppercase tracking-wide">PRIORITY <span className="text-[#ec4899]">*</span></label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-12 px-4 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] font-bold focus:outline-none rounded-xl text-black dark:text-white bg-white dark:bg-slate-900 appearance-none cursor-pointer transition-shadow"
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-black dark:text-white text-[10px] md:text-sm uppercase tracking-wide">DEADLINE</label>
                  <input 
                    type="datetime-local" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] font-bold focus:outline-none rounded-xl text-black dark:text-white bg-white dark:bg-slate-900 transition-shadow"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black dark:text-white text-[10px] md:text-sm uppercase tracking-wide">RECURRENCE</label>
                <select 
                  value={recurrence} 
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full h-12 px-4 border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] font-bold focus:outline-none rounded-xl text-black dark:text-white bg-white dark:bg-slate-900 appearance-none cursor-pointer transition-shadow"
                >
                  <option value="none">Onetime Task</option>
                  <option value="daily">Everyday</option>
                  <option value="weekdays">Monday - Friday</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  className="flex-1 h-12 rounded-xl border-2 border-black dark:border-white font-black text-black dark:text-white bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-0 active:shadow-none hover:-translate-y-1"
                  onClick={() => setIsModalOpen(false)} 
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 h-12 rounded-xl border-2 border-black dark:border-white font-black text-white bg-[#d946ef] dark:bg-[#c026d3] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all uppercase"
                >
                  CREATE TASK
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
