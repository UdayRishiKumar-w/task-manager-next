import { Schema, model, models, type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: [100, "Title cannot exceed 100 characters"] },
    completed: { type: Boolean, default: false },
    started: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: [500, "Description cannot exceed 500 characters"] },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

TaskSchema.pre("save", function () {
  if (this.completed) {
    this.started = true;
  }
});

TaskSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update && typeof update === "object") {
    type UpdateType = Record<string, unknown> & { $set?: Record<string, unknown> };
    const updateObj = update as UpdateType;
    const completed = (updateObj.completed ?? updateObj.$set?.completed) as boolean | undefined;
    if (completed) {
      updateObj.$set ??= {};
      updateObj.$set.started = true;
    }
  }
});

TaskSchema.index({ userId: 1, dueDate: 1 });

TaskSchema.virtual("id").get(function () {
  return this._id.toString();
});

TaskSchema.plugin(mongooseLeanVirtuals);

export type TaskSchemaType = InferSchemaType<typeof TaskSchema>;
export const Task: Model<TaskSchemaType> = models.Task ?? model<TaskSchemaType>("Task", TaskSchema);
export type TaskDocument = HydratedDocument<TaskSchemaType>;
