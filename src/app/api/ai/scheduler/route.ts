import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { askGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { routine } = await req.json();

    await connectToDatabase();
    
    const activeTasks = await Task.find({ user: (session.user as any).id, status: { $ne: "completed" } });

    if (activeTasks.length === 0) {
      return NextResponse.json({ 
        schedule: [
          { start: routine.wakeTime, end: routine.sleepTime, title: "Free Time! No active tasks.", duration: "All Day", priority: "low", type: "break" }
        ] 
      });
    }

    const simplifiedTasks = activeTasks.map(t => ({
      title: t.title,
      priority: t.priority,
      deadline: t.deadline || "None",
      status: t.status
    }));

    const systemPrompt = `
      You are an expert AI Scheduler. You need to map out a precise daily timetable for a user based on their routine and their open tasks.
      
      User's Daily Routine Configuration:
      - Wake Up: ${routine.wakeTime || "07:00"}
      - Work Window: ${routine.workStart || "09:00"} to ${routine.workEnd || "17:00"}
      - Study Window: ${routine.studyStart || "19:00"} to ${routine.studyEnd || "21:30"}
      - Sleep Time: ${routine.sleepTime || "23:00"}
      - Preferred Chunk Size: ${routine.chunkSize || "45m"} per work/study block
      - Break Size: ${routine.breakSize || "15m"}
      
      Pending Tasks:
      ${JSON.stringify(simplifiedTasks)}

      Rules:
      1. Allocate urgent and high priority tasks to the earliest possible periods within the Work or Study windows.
      2. Do NOT assign tasks outside of Work or Study windows (e.g., between Wake Up and Work Start, or between Work End and Study Start unless necessary).
      3. Intersperse predefined "Quick Break" or "Long Break" items of the configured size between task blocks.
      4. Only return a strict JSON array of objects fitting this interface exactly:
         Array<{ start: "HH:MM", end: "HH:MM", title: string, duration: string, priority: "urgent" | "high" | "medium" | "low", type: "task" | "break" }>
      5. Do NOT wrap the JSON in Markdown ticks. Return ONLY the bare parseable JSON array, no other text.
    `;

    const rawContent = await askGemini(systemPrompt, 0.2);
    let schedule: Array<{ start: string; end: string; title: string; duration: string; priority: string; type: string }> = [];
    try {
      const match = rawContent.match(/\[[\s\S]*\]/);
      const jsonStr = match ? match[0] : rawContent;
      schedule = JSON.parse(jsonStr);
    } catch {
      console.error("Scheduler Parse Error Content:", rawContent);
      throw new Error("Failed to parse AI schedule JSON");
    }

    return NextResponse.json({ schedule });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduler AI Error:", message);
    return NextResponse.json({ message: "Failed to generate schedule." }, { status: 500 });
  }
}
