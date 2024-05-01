import {Schema, model, models} from "mongoose";
interface IApiKey {
  key: string;
  permissions: string[];
  usage: number;
}
const apiKeySchema = new Schema(
  {
    key: {type: String, required: true, unique: true},
    permissions: {type: [String], required: true},
    usage: {type: Number, default: 0},
  },
  {timestamps: true}
);
const ApiKey = models.ApiKey || model<IApiKey>("ApiKey", apiKeySchema);
export default ApiKey;
