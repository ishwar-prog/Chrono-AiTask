"use client";

import { useEffect, useState } from "react";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

interface ITask {
  _id: string;
  status: "pending" | "completed" | "overdue";
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [filter, setFilter] = useState("30"); // days

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) {
      setTasks(await res.json());
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 1. Filter tasks by Date Range
  const now = new Date();
  const filterDate = new Date();
  if (filter !== "all") {
    filterDate.setDate(now.getDate() - parseInt(filter));
  }
  
  const filteredTasks = tasks.filter(t => filter === "all" ? true : new Date(t.createdAt) >= filterDate);

  // 2. Compute KPI Metrics
  const completedCount = filteredTasks.filter(t => t.status === "completed").length;
  const pendingCount = filteredTasks.filter(t => t.status === "pending").length;
  const overdueCount = filteredTasks.filter(t => t.status === "overdue").length;
  const totalCount = filteredTasks.length;
  
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  let avgCompletionTime = "0.0";
  const completedTasks = filteredTasks.filter(t => t.status === "completed");
  if (completedTasks.length > 0) {
    const totalDays = completedTasks.reduce((acc, t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.updatedAt).getTime();
      return acc + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCompletionTime = (totalDays / completedTasks.length).toFixed(1);
  }

  // 3. Prepare Chart Data
  // Bar Chart: Weekly Productivity (completed per day over last 7 visible days roughly, or spanning the filter)
  const labels = [];
  const barData = [];
  const lineDataPending = [];
  const lineDataCompleted = [];
  
  // Create an array of N days
  const daysToShow = filter === "all" ? 30 : parseInt(filter);
  for (let i = daysToShow - 1; i >= 0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
     labels.push(dateStr);
     
     // count completions on this exact day
     const completions = completedTasks.filter(t => new Date(t.updatedAt).toDateString() === d.toDateString()).length;
     barData.push(completions);

     const runningCompleted = completedTasks.filter(t => new Date(t.updatedAt) <= d).length;
     lineDataCompleted.push(runningCompleted);
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#6B7280', // Neutral gray
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(156, 163, 175, 0.2)' }, ticks: { color: '#6B7280' } },
      y: { grid: { color: 'rgba(156, 163, 175, 0.2)' }, ticks: { color: '#6B7280' }, beginAtZero: true }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in transition-all pb-12 w-full max-w-7xl mx-auto md:px-4">
      
      {/* Top Header & Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black dark:text-white">ANALYTICS</h1>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white px-4 py-2 rounded-xl font-bold outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <span className="text-3xl md:text-4xl mb-2">✅</span>
          <span className="text-3xl md:text-4xl font-black text-black dark:text-white">{completedCount}</span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mt-1">COMPLETED</span>
        </div>
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <span className="text-3xl md:text-4xl mb-2">⏳</span>
          <span className="text-3xl md:text-4xl font-black text-black dark:text-white">{pendingCount}</span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mt-1">PENDING</span>
        </div>
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <span className="text-3xl md:text-4xl mb-2">🚨</span>
          <span className="text-3xl md:text-4xl font-black text-black dark:text-white">{overdueCount}</span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mt-1">OVERDUE</span>
        </div>
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-transform hover:-translate-y-1">
          <span className="text-3xl md:text-4xl mb-2">📊</span>
          <span className="text-3xl md:text-4xl font-black text-black dark:text-white">{completionRate}%</span>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mt-1">COMPLETION RATE</span>
        </div>
      </div>

      {/* Avg Completion Banner */}
      <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-xl p-4 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">
        Avg completion time: <span className="text-black dark:text-white font-black ml-1">{avgCompletionTime} days</span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Weekly Productivity Bar */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-5 md:p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <h3 className="text-black dark:text-white font-black uppercase text-sm tracking-widest mb-6 border-b-2 border-black/10 dark:border-white/10 pb-4">WEEKLY PRODUCTIVITY</h3>
          <div className="h-48 md:h-64">
            <Bar 
              data={{
                labels,
                datasets: [{ 
                  data: barData, 
                  backgroundColor: '#F97316', 
                  borderRadius: 4,
                  barPercentage: 0.6
                }]
              }} 
              options={chartOptions} 
            />
          </div>
        </div>

        {/* Status Doughnut */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-5 md:p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          <h3 className="text-black dark:text-white font-black uppercase text-sm tracking-widest mb-6 border-b-2 border-black/10 dark:border-white/10 pb-4">STATUS DISTRIBUTION</h3>
          <div className="h-48 md:h-64 flex justify-center">
            {totalCount > 0 ? (
              <Doughnut 
                data={{
                  labels: ['Completed', 'Pending', 'Overdue'],
                  datasets: [{
                    data: [completedCount, pendingCount, overdueCount],
                    backgroundColor: ['#22C55E', '#F97316', '#EF4444'],
                    borderWidth: 2,
                    borderColor: '#000', // Hardcoded black border for retro style
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  color: '#6B7280', // neutral label colors
                  plugins: { 
                    legend: { display: true, position: 'right', labels: { color: '#6B7280', font: { weight: 'bold' } } } 
                  },
                  cutout: '65%'
                }}
              />
            ) : (
              <div className="flex items-center text-gray-500 font-bold">No data available</div>
            )}
          </div>
        </div>

        {/* Completion Trends Line */}
        <div className="bg-[#FCF9F1] dark:bg-slate-800 border-2 border-black dark:border-white rounded-2xl p-5 md:p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] lg:col-span-2">
          <h3 className="text-black dark:text-white font-black uppercase text-sm tracking-widest mb-6 border-b-2 border-black/10 dark:border-white/10 pb-4">COMPLETION TRENDS</h3>
          <div className="h-48 md:h-64">
            <Line 
              data={{
                labels,
                datasets: [{
                  data: lineDataCompleted,
                  borderColor: '#0EA5E9',
                  backgroundColor: 'transparent',
                  borderWidth: 3,
                  tension: 0.4,
                  pointRadius: 0
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
