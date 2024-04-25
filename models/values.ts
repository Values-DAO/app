import mongoose, {Schema, models} from "mongoose";

const valueSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      set: (v: string) => v.toLowerCase(),
    },
    value: {
      type: {
        metadata: {
          name: String,
          description: String,
          image: String,
        },
        cid: String,
      },
      required: true,
    },
    minters: {
      type: [String],
    },
    id: {
      type: Schema.Types.ObjectId,
    },
  },
  {timestamps: true}
);

const Value = models.Value || mongoose.model("Value", valueSchema);
export default Value;
