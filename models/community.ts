import {model, models, Schema} from "mongoose";

const communitySchema = new Schema({
  communityId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    set: (val: string) => val.toLowerCase(),
  },
  minters: {
    type: [{type: Schema.Types.ObjectId, ref: "Users"}],
    default: [],
  },
  values: {
    type: [{type: Schema.Types.ObjectId, ref: "Values"}],
    default: [],
  },
  verifiedCommunity: {
    type: Boolean,
    default: false,
  },
  communityTokens: [
    {
      tokenType: {
        type: String,
        required: true,
        default: "ERC20",
      },
      tokenContractAddress: {
        type: String,
        required: true,
      },
      tokenChainId: {
        type: String,
        required: true,
      },
    },
  ],
  valuesSource: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
  },
});

const Communities = models.Communities || model("Communities", communitySchema);
export default Communities;
