import mongoose, {models, Schema} from "mongoose";

const identifierSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: true,
  },
  emailLogin: {
    type: Boolean,
    default: false,
  },
  warpcastLogin: {
    type: Boolean,
    default: false,
  },
  twitterConnection: {
    type: Boolean,
    default: false,
  },
  valuesGenerated: {
    twitter: {
      type: Boolean,
      default: false,
    },
    warpcast: {
      type: Boolean,
      default: false,
    },
  },
  spectrum: {
    twitter: {
      type: Boolean,
      default: false,
    },
    warpcast: {
      type: Boolean,
      default: false,
    },
  },
  pregeneration: {
    twitter: {
      type: Boolean,
      default: false,
    },
    warpcast: {
      type: Boolean,
      default: false,
    },
  },
});

const Identifier =
  models.Identifier || mongoose.model("Identifier", identifierSchema);
export default Identifier;
