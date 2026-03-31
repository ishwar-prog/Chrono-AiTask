import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // @ts-ignore
    const userTasks = await Task.find({ user: session.user.id }).sort({ createdAt: -1 });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

    let updatesMade = false;
    const bulkOps = [];

    for (const task of userTasks) {
      // 1. Auto resolve Overdues
      if (task.status === "pending" && task.deadline && new Date(task.deadline) < now) {
        task.status = "overdue";
        bulkOps.push({
          updateOne: {
            filter: { _id: task._id },
            update: { $set: { status: "overdue" } }
          }
        });
        updatesMade = true;
      }

      // 2. Logic to auto-spawn recurrences (simplistic logic: create a new task instance for today if it doesn't exist)
      if (task.recurrence && task.recurrence !== "none") {
        if (task.recurrence === "daily" || (task.recurrence === "weekdays" && isWeekday)) {
          // Check if a task with the VERY same exact base title exists created *today*
          // This prevents infinite spawning
          const hasSpawnedToday = userTasks.some(t => 
            t.title === task.title && 
            t._id.toString() !== task._id.toString() &&
            t.createdAt && t.createdAt.toISOString().startsWith(todayStr)
          );
          
          const isBaseCreatedToday = task.createdAt && task.createdAt.toISOString().startsWith(todayStr);

          // We only spawn if the original task wasn't created today AND no spawn exists for today
          if (!hasSpawnedToday && !isBaseCreatedToday) {
            // Spawn new instance
            // We set deadline to end of today if it's recurring daily
            const deadline = new Date(now);
            deadline.setHours(23, 59, 59, 999);
            
            bulkOps.push({
              insertOne: {
                document: {
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  status: "pending",
                  deadline: deadline,
                  recurrence: task.recurrence,
                  aiScore: task.aiScore,
                  // @ts-ignore
                  user: session.user.id,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              }
            });
            updatesMade = true;
          }
        }
      }
    }

    if (updatesMade && bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
      // Re-fetch cleanly after mutation to serve correct local state
      // @ts-ignore
      const newTasks = await Task.find({ user: session.user.id }).sort({ createdAt: -1 });
      return NextResponse.json(newTasks);
    }

    return NextResponse.json(userTasks);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, priority, deadline, recurrence } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newTask = await Task.create({
      title,
      description,
      priority: priority || "Medium",
      deadline: deadline ? new Date(deadline) : undefined,
      recurrence: recurrence || "none",
      // @ts-ignore
      user: session.user.id,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
