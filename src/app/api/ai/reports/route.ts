import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await req.json();

    const systemPrompt = `
      You are a performance insight AI for ChronoTask. 
      The user just loaded their Monthly Report.
      
      Here are their stats for this month:
      - Total Tasks: ${stats.total}
      - Completed: ${stats.completed}
      - Not Done / Overdue: ${stats.notDone}
      - Completion Rate: ${stats.rate}%
      - Current Score: ${stats.score}/10
      
      Generate exactly ONE short, punchy sentence (maximum 20 words) analyzing their performance.
      If rate is low, suggest improvement like "Many tasks are being missed. Consider reducing task load."
      If rate is high, encourage them like "Incredible momentum this month! Keep crushing those high priority items."
      Do not use quotation marks. Do not use hashtags.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.5,
    });

    const insight = response.choices[0].message?.content || "Keep striving for greatness every single day.";

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error("Reports AI Error:", error);
    return NextResponse.json({ insight: "Keep pushing forward, maintain focus on your daily targets." }, { status: 500 });
  }
}
