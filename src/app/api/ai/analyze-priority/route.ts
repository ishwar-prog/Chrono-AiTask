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
    
    const tasks = await Task.find({ user: (session.user as any).id, status: { $ne: "completed" } });

    if (tasks.length === 0) {
      return NextResponse.json({ message: "No pending tasks to analyze" });
    }

    const tasksData = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      priority: t.priority,
      deadline: t.deadline,
    }));

    const prompt = `
      You are an AI task scheduler. Given the following list of tasks, assign each task a score between 0.00 and 1.00 representing its absolute priority.
      A higher score means higher urgency/importance. Focus on deadlines and the Priority label (Urgent > High > Medium > Low).
      
      Tasks: ${JSON.stringify(tasksData)}
      
      Return ONLY a raw JSON array of objects with the following format, no markdown, no backticks, no explanation:
      [
        { "id": "task_id_here", "aiScore": 0.95 }
      ]
    `;

    const content = await askGemini(prompt, 0.1);
    let scores: Array<{ id: string; aiScore: number }> = [];
    try {
      const match = content.match(/\[[\s\S]*\]/);
      const jsonStr = match ? match[0] : content;
      scores = JSON.parse(jsonStr);
    } catch {
      console.error("Parse Error Content:", content);
      throw new Error("Failed to parse AI response JSON");
    }

    // Bulk update tasks with their new scores
    const bulkOps = scores.map((scoreObj) => ({
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
    console.error("AI Priority Analysis Error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
