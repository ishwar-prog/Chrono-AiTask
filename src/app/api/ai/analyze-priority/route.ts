import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { askGemini, extractJsonArray } from "@/lib/gemini";

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
      return NextResponse.json({ message: "No pending tasks to analyze" });
    }

    const tasksData = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      priority: t.priority,
      deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
    }));

    const prompt = `You are an AI task prioritizer. Score each task from 0.00 to 1.00.
Higher score = more urgent/important.

Scoring rules:
- Priority weight: Urgent=0.9+, High=0.7-0.9, Medium=0.4-0.7, Low=0.1-0.4
- Closer deadlines increase the score
- No deadline = use priority weight only

Tasks: ${JSON.stringify(tasksData)}

Return ONLY a JSON array, no markdown, no backticks, no explanation:
[{"id":"task_id","aiScore":0.95}]`;

    const content = await askGemini(prompt, 0.1);
    const scores = extractJsonArray(content) as Array<{ id: string; aiScore: number }>;

    // Bulk update tasks with their new scores
    const bulkOps = scores
      .filter((s) => s.id && typeof s.aiScore === "number")
      .map((scoreObj) => ({
        updateOne: {
          filter: { _id: scoreObj.id },
          update: { $set: { aiScore: scoreObj.aiScore } },
        },
      }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: "Tasks analyzed successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Priority Analysis Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
