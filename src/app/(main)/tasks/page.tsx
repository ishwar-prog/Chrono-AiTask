"use client";

import { useState, useEffect } from "react";
import { CartoonButton } from "@/components/CartoonButton";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonBadge } from "@/components/CartoonBadge";
import { Check, Edit2, Trash2, Search, Filter } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in transition-all pb-12 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">Tasks</h1>
        <CartoonButton 
          label="+ NEW TASK" 
          color="bg-[#F97316]" 
          onClick={() => setIsModalOpen(true)} 
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#181C25] p-4 rounded-xl border-2 border-[#D1D5DB] shadow-[4px_4px_0_0_#D1D5DB]">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-[#0F172A] border-2 border-white rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
          />
        </div>
        <div className="md:col-span-3">
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="w-full h-12 px-4 bg-[#0F172A] border-2 border-white rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] appearance-none"
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
            className="w-full h-12 px-4 bg-[#0F172A] border-2 border-white rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="font-bold text-white">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <CartoonCard key={task._id} className="flex flex-col justify-between bg-[#1D172A] dark:bg-[#1D172A] border-[#A855F7] shadow-[4px_4px_0_0_#A855F7] text-white">
              <div>
                <h3 className="font-black text-xl mb-1 truncate text-white">{task.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <CartoonBadge variant={task.priority === "Urgent" ? "error" : task.priority === "High" ? "warning" : "default"}>
                    {task.priority}
                  </CartoonBadge>
                  {task.recurrence !== "none" && (
                    <CartoonBadge variant="info">
                      🔁 {task.recurrence === "daily" ? "Everyday" : "Mon-Fri"}
                    </CartoonBadge>
                  )}
                  {task.deadline && (
                    <CartoonBadge variant="default">
                      {format(new Date(task.deadline), "MMM dd, h:mm a")}
                    </CartoonBadge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-600">
                <span className={`text-xs font-black uppercase px-2 py-1 rounded ${task.status === "completed" ? "bg-green-500/20 text-green-400" : task.status === "overdue" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {task.status}
                </span>

                <div className="flex items-center justify-end gap-3">
                  {task.status !== "completed" && (
                     <button 
                      onClick={() => completeTask(task._id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-[#A3E635] border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
                      aria-label="Complete"
                    >
                      <Check className="w-5 h-5 text-black" strokeWidth={3} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task._id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FDA4AF] border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-black" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </CartoonCard>
          ))}
          
          {filteredTasks.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 font-bold text-lg border-2 border-dashed border-gray-600 rounded-xl">
               No tasks found matching constraints. Let's create one!
             </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <CartoonCard className="w-full max-w-lg bg-[#181C25] border-2 border-white shadow-[6px_6px_0_0_#fff] animate-in zoom-in-95 p-6">
            <h2 className="text-2xl font-black mb-6 uppercase text-white border-b-2 border-gray-700 pb-4">CREATE TASK</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="font-bold text-white text-sm uppercase tracking-wide">TITLE <span className="text-[#F97316]">*</span></label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="What needs to be done?"
                  className="w-full h-12 px-4 shadow-[2px_2px_0_0_#F97316] border-2 border-[#F97316] font-bold focus:outline-none focus:ring-0 rounded-lg text-white bg-[#0F172A]"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white text-sm uppercase tracking-wide">DESCRIPTION</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Add details..."
                  className="w-full p-4 border-2 border-gray-500 shadow-[2px_2px_0_0_#6B7280] font-bold focus:outline-none rounded-lg text-white bg-[#0F172A] resize-none"
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-white text-sm uppercase tracking-wide">PRIORITY <span className="text-[#F97316]">*</span></label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-12 px-4 border-2 border-gray-500 shadow-[2px_2px_0_0_#6B7280] font-bold focus:outline-none rounded-lg text-white bg-[#0F172A] appearance-none cursor-pointer"
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white text-sm uppercase tracking-wide">DEADLINE</label>
                  <input 
                    type="datetime-local" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-gray-500 shadow-[2px_2px_0_0_#6B7280] font-bold focus:outline-none rounded-lg text-white bg-[#0F172A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white text-sm uppercase tracking-wide">RECURRENCE</label>
                <select 
                  value={recurrence} 
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full h-12 px-4 border-2 border-gray-500 shadow-[2px_2px_0_0_#6B7280] font-bold focus:outline-none rounded-lg text-white bg-[#0F172A] appearance-none"
                >
                  <option value="none">Onetime Task</option>
                  <option value="daily">Everyday</option>
                  <option value="weekdays">Monday - Friday</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  className="flex-1 h-12 rounded-xl border-2 border-gray-500 font-black text-gray-300 hover:text-white bg-[#1E293B] hover:bg-gray-700 transition-all active:translate-y-1"
                  onClick={() => setIsModalOpen(false)} 
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 h-12 rounded-xl border-2 border-white font-black text-white bg-[#F97316] hover:bg-[#ea580c] shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all uppercase"
                >
                  Create Task
                </button>
              </div>

            </form>
          </CartoonCard>
        </div>
      )}
    </div>
  );
}
