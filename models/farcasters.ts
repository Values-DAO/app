import {model, models, Schema} from "mongoose";
export interface IFarcasterUser {
  fid: number;
  name: string;
  username: string;
  image: string;
  wallets: string[];
  genratedValues: string[];
  lastFetchedDate: Date;
}

const farcastersSchema = new Schema({
  fid: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  wallets: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: "",
  },
  generatedValues: {
    type: [String],
    default: [],
  },
  lastFetchedDate: {
    type: Date,
    default: Date.now,
  },
});

const FarcasterUser =
  models.FarcasterUser || model("FarcasterUser", farcastersSchema);
export default FarcasterUser;
