import mongoose, {Schema, models} from "mongoose";

export type IValue = {
  name?: string;
};

const valueSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
    },
  },
  {timestamps: true}
);
valueSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.toLowerCase();
  }
  next();
});
const Value = models.Value || mongoose.model("Value", valueSchema);
export default Value;
