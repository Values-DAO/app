import mongoose, {model, models, Schema} from "mongoose";
interface IFARCASTERMEETUP {
  fid: string;
  username: string;
  address: string[];
  image: string;
}
const farcasterMeetup = new Schema({
  fid: {type: String},
  username: {type: String},
  address: {type: [String]},
  image: {type: String},
});

const FarcasterMeetup =
  models.Farcon || model<IFARCASTERMEETUP>("FarcasterMeetup", farcasterMeetup);
export default FarcasterMeetup;
