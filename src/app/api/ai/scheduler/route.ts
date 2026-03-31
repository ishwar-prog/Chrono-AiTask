import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import Schedule from "@/models/Schedule";
import { askGroq, extractJsonArray } from "@/lib/groq";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { routine } = await req.json();

    await connectToDatabase();

    const activeTasks = await Task.find({
      user: (session.user as Record<string, unknown>).id,
      status: { $ne: "completed" },
    });

    if (activeTasks.length === 0) {
      return NextResponse.json({
        schedule: [
          {
            start: routine.wakeTime || "07:00",
            end: routine.sleepTime || "23:00",
            title: "No active tasks — enjoy your day!",
            duration: "All Day",
            priority: "low",
            type: "break",
          },
        ],
      });
    }

    const now = new Date();
    const todayDate = format(now, "yyyy-MM-dd");

    const taskLines = activeTasks.map((t) => {
      const dl = t.deadline
        ? format(new Date(t.deadline), "yyyy-MM-dd HH:mm")
        : "none";
      const dueToday = t.deadline
        ? format(new Date(t.deadline), "yyyy-MM-dd") === todayDate
        : false;
      return `- "${t.title}" (priority:${t.priority.toLowerCase()}, deadline:${dl}, id:${t._id.toString()}${dueToday ? ", DUE_TODAY" : ""})`;
    }).join("\n");

    const prompt = `Create a short daily schedule as JSON array. Today: ${todayDate}.
Day: ${routine.wakeTime || "07:00"} to ${routine.sleepTime || "23:30"}.
Work: ${routine.workStart || "09:00"}-${routine.workEnd || "17:30"}. Study: ${routine.studyStart || "19:00"}-${routine.studyEnd || "21:30"}.

User tasks:
${taskLines}

IMPORTANT RULES:
1. Each task appears EXACTLY ONCE. NEVER repeat a task. ${activeTasks.length} tasks = ${activeTasks.length} task blocks maximum.
2. Include: Breakfast(30m), Lunch(45m), Dinner(30m).
3. Include 2-3 breaks(15m each), NOT more.
4. For gaps between tasks/meals, use "Work" or "Study" as filler (type:"task", taskId:"").
5. Keep it SHORT: around ${activeTasks.length + 8} blocks total (tasks + 3 meals + 2-3 breaks + 1-2 work/study fillers).
6. DUE_TODAY tasks go first in morning.
7. No "Free Time" blocks.

JSON format — return ONLY the array:
[{"start":"09:00","end":"09:45","title":"Task Name","duration":"45m","priority":"high","type":"task","taskId":"id","isDueToday":false}]
type must be "task","meal", or "break". taskId="" for meals/breaks/fillers.`;

    const rawContent = await askGroq(prompt, 0.1);
    const schedule = extractJsonArray(rawContent) as Array<{
      start: string;
      end: string;
      title: string;
      duration: string;
      priority: string;
      type: string;
      taskId?: string;
      isDueToday?: boolean;
    }>;

    // ---- SERVER-SIDE CLEANUP ----
    // 1. Remove filler/junk blocks
    const cleaned = schedule.filter(
      (b) =>
        b.start && b.end && b.title && b.type &&
        !b.title.toLowerCase().includes("free time") &&
        !b.title.toLowerCase().includes("wind down") &&
        !b.title.toLowerCase().includes("end of")
    );

    // 2. DEDUPLICATE: each task title can only appear ONCE
    const seenTitles = new Set<string>();
    const deduped = cleaned.filter((block) => {
      // Allow multiple meals and breaks (they share names and that's fine)
      if (block.type === "meal" || block.type === "break") {
        return true;
      }
      const key = block.title.toLowerCase().trim();
      if (seenTitles.has(key)) {
        return false; // duplicate task — remove it
      }
      seenTitles.add(key);
      return true;
    });

    if (deduped.length === 0) {
      throw new Error("AI returned an empty or malformed schedule.");
    }

    // Save to Database
    await Schedule.findOneAndUpdate(
      { user: (session.user as Record<string, unknown>).id },
      { blocks: deduped, routine: routine, dateGenerated: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ schedule: deduped });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduler AI Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
