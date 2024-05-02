import mongoose, {model, models, Schema} from "mongoose";
interface IFarcon {
  fid: string;
  username: string;
  address: string[];
  image: string;
}
const farconSchema = new Schema({
  fid: {type: String},
  username: {type: String},
  address: {type: [String]},
  image: {type: String},
});

const Farcon = models.Farcon || model<IFarcon>("Farcon", farconSchema);
export default Farcon;
