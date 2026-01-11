import { User } from "@/models/User";
import DataLoader from "dataloader";

export const createUserLoader = () =>
  new DataLoader<string, InstanceType<typeof User>>(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } }, {}, { virtuals: true }).exec();
    const map = new Map(users.map((u) => [u._id.toString(), u]));
    return userIds.map((id) => {
      const user = map.get(id);
      if (!user) {
        throw new Error(`User not found: ${id}`);
      }
      return user;
    });
  });
