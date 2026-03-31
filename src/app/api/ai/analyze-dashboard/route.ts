import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { askGemini } from "@/lib/gemini";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const tasks = await Task.find({
      user: (session.user as Record<string, unknown>).id,
      status: { $ne: "completed" },
    });

    if (tasks.length === 0) {
      return NextResponse.json({
        analysis: "You currently have no pending tasks! Great job. Relax and take a break. 🎉",
      });
    }

    const tasksData = tasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline ? new Date(t.deadline).toISOString() : "No deadline",
    }));

    const prompt = `You are a friendly AI productivity assistant for "ChronoTask".
Analyze these tasks and generate a priority report in markdown:

Tasks: ${JSON.stringify(tasksData, null, 2)}

Current time: ${new Date().toISOString()}

Format your response EXACTLY like this (fill in real data):

Hey there! Let's get your tasks sorted for maximum productivity! 🚀

1. **Do FIRST:** "[Most urgent task]" — [reason]. 
2. **Priority Adjustments:** [Any tasks that should be reprioritized].
3. **Urgent Deadline Warnings:**
   * "[Task]" - Due [when]! ⏰
4. **Smart Order for Today:**
   1. [Task 1]
   2. [Task 2]
   3. [Task 3]

Let's crush these! 💪

RULES:
- A task is "DO TODAY" ONLY if its deadline is within 48 hours from now.
- Sort by: Urgent > High > Medium > Low, then by nearest deadline.
- Return ONLY the markdown, no extra commentary.`;

    const analysisText = await askGemini(prompt, 0.4);

    return NextResponse.json({
      analysis: analysisText || "No analysis could be completed.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown AI error";
    console.error("Dashboard Analysis Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
