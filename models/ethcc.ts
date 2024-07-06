import mongoose, {Schema, models} from "mongoose";

const attendeeSchema = new Schema(
  {
    fid: {
      type: Number,
      required: true,
      unique: true,
    },
  },

  {timestamps: true}
);

const ETHCCAttendee =
  models.attendeeSchema || mongoose.model("attendeeSchema", attendeeSchema);
export default ETHCCAttendee;
