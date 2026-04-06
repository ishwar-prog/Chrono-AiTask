import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "pending" | "completed" | "overdue";
  deadline?: Date;
  recurrence: "none" | "daily" | "weekdays";
  aiScore: number;
  user: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Urgent", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    deadline: { type: Date },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekdays"],
      default: "none",
    },
    aiScore: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const Task = models.Task || model<ITask>("Task", TaskSchema);

export default Task;
