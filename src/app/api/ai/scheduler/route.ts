import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { askGemini, extractJsonArray } from "@/lib/gemini";

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
            title: "Free Time! No active tasks.",
            duration: "All Day",
            priority: "low",
            type: "break",
          },
        ],
      });
    }

    const simplifiedTasks = activeTasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      deadline: t.deadline ? new Date(t.deadline).toISOString() : "No deadline",
      status: t.status,
    }));

    const prompt = `You are an AI daily scheduler. Create a timetable for today.

User's routine:
- Wake: ${routine.wakeTime || "07:00"}
- Work: ${routine.workStart || "09:00"} to ${routine.workEnd || "17:00"}
- Study: ${routine.studyStart || "19:00"} to ${routine.studyEnd || "21:30"}
- Sleep: ${routine.sleepTime || "23:00"}
- Work chunks: ${routine.chunkSize || "45m"}, Breaks: ${routine.breakSize || "15m"}

Tasks to schedule:
${JSON.stringify(simplifiedTasks, null, 2)}

Rules:
1. Place urgent/high priority tasks in earliest work slots
2. Add breaks between task blocks
3. Keep tasks within work and study windows only
4. Each block must have: start (HH:MM), end (HH:MM), title, duration, priority (urgent/high/medium/low), type (task/break)

Return ONLY a JSON array, no markdown backticks, no explanation:
[{"start":"09:00","end":"09:45","title":"Task Name","duration":"45m","priority":"high","type":"task"}]`;

    const rawContent = await askGemini(prompt, 0.2);
    const schedule = extractJsonArray(rawContent) as Array<{
      start: string;
      end: string;
      title: string;
      duration: string;
      priority: string;
      type: string;
    }>;

    // Validate the schedule has the right shape
    const validSchedule = schedule.filter(
      (block) => block.start && block.end && block.title && block.type
    );

    if (validSchedule.length === 0) {
      throw new Error("AI returned an empty or malformed schedule.");
    }

    return NextResponse.json({ schedule: validSchedule });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduler AI Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
