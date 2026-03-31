import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // @ts-ignore
    const tasks = await Task.find({ user: session.user.id, status: { $ne: "completed" } });

    if (tasks.length === 0) {
      return NextResponse.json({ message: "No pending tasks to analyze" });
    }

    const tasksData = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      priority: t.priority,
      deadline: t.deadline,
    }));

    const prompt = `
      You are an AI task scheduler. Given the following list of tasks, assign each task a score between 0.00 and 1.00 representing its absolute priority.
      A higher score means higher urgency/importance. Focus on deadlines and the Priority label (High > Medium > Low).
      
      Tasks: ${JSON.stringify(tasksData)}
      
      Return ONLY a JSON array of objects with the following format:
      [
        { "id": "task_id", "aiScore": 0.95 }, ...
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message?.content || "[]";
    let scores = [];
    try {
      scores = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse AI response");
    }

    // Bulk update tasks with their new scores
    const bulkOps = scores.map((scoreObj: any) => ({
      updateOne: {
        filter: { _id: scoreObj.id },
        update: { $set: { aiScore: scoreObj.aiScore } },
      },
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: "Tasks analyzed successfully" });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
