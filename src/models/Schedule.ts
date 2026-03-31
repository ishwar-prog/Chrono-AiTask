import { Schema, model, models, Document, Types } from "mongoose";

export interface IScheduleBlock {
  start: string;
  end: string;
  title: string;
  duration: string;
  priority: "urgent" | "high" | "medium" | "low" | string;
  type: "task" | "break" | string;
  taskId?: string;
  isDueToday?: boolean;
}

export interface IRoutine {
  wakeTime: string;
  workStart: string;
  workEnd: string;
  studyStart: string;
  studyEnd: string;
  sleepTime: string;
  breakSize: string;
  chunkSize: string;
}

export interface ISchedule extends Document {
  user: Types.ObjectId;
  dateGenerated: Date;
  routine: IRoutine;
  blocks: IScheduleBlock[];
}

const ScheduleBlockSchema = new Schema<IScheduleBlock>({
  start: { type: String, required: true },
  end: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  priority: { type: String, default: "medium" },
  type: { type: String, default: "task" },
  taskId: { type: String, default: "" },
  isDueToday: { type: Boolean, default: false },
});

const RoutineSchema = new Schema<IRoutine>({
  wakeTime: { type: String, default: "07:00" },
  workStart: { type: String, default: "09:00" },
  workEnd: { type: String, default: "17:30" },
  studyStart: { type: String, default: "19:00" },
  studyEnd: { type: String, default: "21:30" },
  sleepTime: { type: String, default: "23:30" },
  breakSize: { type: String, default: "15m" },
  chunkSize: { type: String, default: "45m" },
});

const ScheduleSchema = new Schema<ISchedule>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dateGenerated: { type: Date, default: Date.now },
    routine: { type: RoutineSchema, required: true },
    blocks: { type: [ScheduleBlockSchema], default: [] },
  },
  { timestamps: true }
);

const Schedule = models.Schedule || model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
