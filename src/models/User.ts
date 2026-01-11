import { Schema, model, models, type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    password: { type: String, required: false, select: false },
    authProviderId: {
      type: String,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

UserSchema.virtual("id").get(function () {
  return this._id.toString();
});

UserSchema.plugin(mongooseLeanVirtuals);

export type UserSchemaType = InferSchemaType<typeof UserSchema>;
export const User: Model<UserSchemaType> = models.User ?? model("User", UserSchema);
export type UserDocument = HydratedDocument<UserSchemaType>;
