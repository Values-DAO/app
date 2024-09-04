import mongoose, {models, Schema} from "mongoose";

const valueSchema = new Schema({
  valueId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    set: (val: string) => val.toLowerCase(),
    unique: true,
  },
  minters: {
    type: [{type: Schema.Types.ObjectId, ref: "Users"}],
    default: [],
  },
});
const Values = models.Values || mongoose.model("Values", valueSchema);
export default Values;
