"use client";

import { useState, useEffect } from "react";
import { CartoonButton } from "@/components/CartoonButton";
import { CartoonCard } from "@/components/CartoonCard";
import { CartoonBadge } from "@/components/CartoonBadge";
import { Check, Edit2, Trash2 } from "lucide-react";
import { ITask } from "@/models/Task";
import { format } from "date-fns";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");

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
      body: JSON.stringify({ title, description, priority }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
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

  return (
    <div className="space-y-8 animate-in fade-in transition-all">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Tasks</h1>
        <CartoonButton 
          label="+ NEW TASK" 
          color="bg-orange-400" 
          onClick={() => setIsModalOpen(true)} 
        />
      </div>

      {loading ? (
        <p className="font-bold">Loading tasks...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <CartoonCard key={task._id as unknown as string} className="flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl mb-1 truncate">{task.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <CartoonBadge variant={task.priority === "High" ? "error" : "warning"}>
                    {task.priority}
                  </CartoonBadge>
                  <CartoonBadge variant="info">
                    AI Score: {task.aiScore ? task.aiScore.toFixed(2) : "0.00"}
                  </CartoonBadge>
                  {task.deadline && (
                    <CartoonBadge variant="default">
                      {format(new Date(task.deadline), "MMM dd")}
                    </CartoonBadge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-dashed border-black dark:border-white">
                <button 
                  onClick={() => completeTask(task._id as unknown as string)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-300 border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  aria-label="Complete"
                >
                  <Check className="w-5 h-5 text-black" strokeWidth={3} />
                </button>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-300 border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  aria-label="Edit"
                >
                  <Edit2 className="w-4 h-4 text-black" strokeWidth={3} />
                </button>
                <button 
                  onClick={() => deleteTask(task._id as unknown as string)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-red-400 border-2 border-black hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4 text-black" strokeWidth={3} />
                </button>
              </div>
            </CartoonCard>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <CartoonCard className="w-full max-w-lg bg-white dark:bg-slate-800 animate-in zoom-in-95">
            <h2 className="text-2xl font-black mb-4 uppercase text-black dark:text-white border-b-2 border-black pb-2">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full h-12 px-4 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400/50 rounded-lg text-black bg-white"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full p-4 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400/50 rounded-lg text-black bg-white resize-none"
                  rows={3} 
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-12 px-4 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400/50 rounded-lg text-black bg-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <div className="flex-1">
                  <CartoonButton 
                    type="button" 
                    label="CANCEL" 
                    color="bg-gray-300" 
                    onClick={() => setIsModalOpen(false)} 
                  />
                </div>
                <div className="flex-1">
                  <CartoonButton 
                    type="submit" 
                    label="CREATE" 
                    color="bg-blue-400" 
                  />
                </div>
              </div>
            </form>
          </CartoonCard>
        </div>
      )}
    </div>
  );
}
