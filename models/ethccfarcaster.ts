import mongoose, {Schema, models} from "mongoose";

const fcAttendeeSchema = new Schema(
  {
    fid: {
      type: Number,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    generatedValues: {
      type: Object,
      required: true,
    },
    wallets: {
      type: Array,
      required: true,
    },
    casts: {
      type: String,
    },
  },

  {timestamps: true}
);

const ETHCCFCAttendee =
  models.fcAttendeeSchema ||
  mongoose.model("fcAttendeeSchema", fcAttendeeSchema);
export default ETHCCFCAttendee;
