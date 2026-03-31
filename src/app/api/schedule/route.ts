import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const schedule = await Schedule.findOne({
      user: (session.user as Record<string, unknown>).id,
    });

    if (!schedule) {
      return NextResponse.json({ schedule: null, routine: null }, { status: 200 });
    }

    return NextResponse.json({ schedule: schedule.blocks, routine: schedule.routine });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET Schedule Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { schedule, routine } = await req.json();

    await connectToDatabase();

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json({ message: "Invalid schedule format" }, { status: 400 });
    }

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { user: (session.user as Record<string, unknown>).id },
      { blocks: schedule, routine: routine || {} },
      { new: true, upsert: true }
    );

    return NextResponse.json({ schedule: updatedSchedule.blocks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PUT Schedule Error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
