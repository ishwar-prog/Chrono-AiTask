import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API,
});

export async function POST(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // @ts-ignore
    const tasks = await Task.find({ user: session.user.id, status: { $ne: "completed" } });

    if (tasks.length === 0) {
      return NextResponse.json({ analysis: "You currently have no pending tasks! Great job. Relax and take a break." });
    }

    const tasksData = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline,
    }));

    const prompt = `
      You are a friendly, highly-energetic AI productivity assistant embedded in the "ChronoTask" dashboard.
      Given the following active and overdue tasks, analyze them and generate a specific priority report.
      
      Tasks List: ${JSON.stringify(tasksData, null, 2)}
      
      Output ONLY a markdown formatted response matching exactly this structural tone and layout:
      
      Hey there! Let's get your tasks sorted for maximum productivity! 🚀

      1. **Do FIRST:** "[Highest priority task name]" (high priority, deadline [deadline details]). [Short reason why it's the closest deadline or most critical].
      2. **Priority Adjustments:** "[Second most important task]" also has a high priority and an early deadline, so it should be considered with equal urgency.
      3. **Urgent Deadline Warnings:**
         * "[Task Title]" - Due [date context]! ⏰
         [List any other tasks here with clock emojis]
      4. **Smart Order for Today:**
         1. [First Task Name]
         2. [Second Task Name]
         3. [Third Task Name]
         ... (list all passed tasks in strict order of importance)

      Let's crush these! 💪
      
      Always adapt the names, dates, and reasoning dynamically based on the Tasks List provided above. 
      CRITICAL RULE: A task is ONLY considered an immediate 'DO TODAY' action if its deadline is strictly within 48 hours from right now. Separate the 'Smart Order for Today' securely based on this 48-hour time constraint!
      Do NOT include any external text other than the exact markdown structure shown.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Slightly higher for friendly tone variation while staying rigid on structure
    });

    const analysisText = response.choices[0].message?.content || "No analysis could be completed.";

    // Trigger basic scoring updates in background asynchronously just in case the db scores drifted
    try {
      // Background score recalc logic could go here
    } catch (e) {}

    return NextResponse.json({ analysis: analysisText });
  } catch (error: any) {
    console.error("Dashboard Analysis Error:", error);
    
    // Explicitly check for quota limit failure
    if (error.status === 429 || error?.error?.code === "insufficient_quota") {
      return NextResponse.json(
        { message: "API limit reached. Please update your API key." }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
