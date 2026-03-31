import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "completed" | "overdue";
  deadline?: Date;
  aiScore: number;
  user: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { 
      type: String, 
      enum: ["High", "Medium", "Low"], 
      default: "Medium" 
    },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    deadline: { type: Date },
    aiScore: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Task = models.Task || model<ITask>("Task", TaskSchema);

export default Task;
