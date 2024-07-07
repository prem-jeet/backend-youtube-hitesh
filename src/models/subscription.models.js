import { Schema, model } from "mongoose";

const subscriptionScheam = new Schema(
  {
    subscriber: {
      type: [Schema.Types.ObjectId], // one who is subscribing to this users channel
      ref: "User",
    },
    channels: {
      type: [Schema.Types.ObjectId], // to user channels who the this user is subscribing
      red: "User",
    },
  },
  { timestamps: true }
);

const Subscription = model("Subscription", subscriptionScheam);

export default Subscription;
