import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { askGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await req.json();

    const prompt = `You are a performance insight AI for ChronoTask.

Stats this month:
- Total Tasks: ${stats.total}
- Completed: ${stats.completed}
- Not Done / Overdue: ${stats.notDone}
- Completion Rate: ${stats.rate}%
- Score: ${stats.score}/10

Generate exactly ONE short, punchy sentence (max 20 words) analyzing performance.
Low rate → suggest improvement. High rate → encourage.
No quotation marks. No hashtags. Return ONLY the sentence.`;

    const insight = await askGroq(prompt, 0.5);

    return NextResponse.json({
      insight: insight.trim() || "Keep striving for greatness every single day.",
    });
  } catch (error: unknown) {
    console.error("Reports AI Error:", error);
    return NextResponse.json(
      { insight: "Keep pushing forward, maintain focus on your daily targets." },
      { status: 200 } // Return 200 with fallback so UI doesn't break
    );
  }
}
