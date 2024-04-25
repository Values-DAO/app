import mongoose, {Schema, models} from "mongoose";

const valueTokenMapSchema = new Schema({
  tokenContractAddress: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },

  id: {
    type: Schema.Types.ObjectId,
  },
});

const ValueTokenMap =
  models.ValueTokenMap || mongoose.model("ValueTokenMap", valueTokenMapSchema);
export default ValueTokenMap;
