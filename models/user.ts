import mongoose, {Schema, models} from "mongoose";

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    profileMinted: {
      type: Boolean,
      default: false,
    },
    profileNft: {
      type: Number,
    },
    email: {
      type: String,
    },
    fid: {
      type: Number,
    },
    twitterUsername: {
      type: String,
    },
    twitterId: {
      type: String,
    },
    wallets: {
      type: [String],
      default: [],
    },
    generatedValues: {
      twitter: {
        type: [String],
        default: [],
      },
      warpcast: {
        type: [String],
        default: [],
      },
    },
    generatedValuesWithWeights: {
      twitter: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      warpcast: {
        type: Map,
        of: Number,
        default: new Map(),
      },
    },
    spectrum: {
      warpcast: {
        type: [
          {
            name: String,
            description: String,
            score: Number,
          },
        ],
        default: [],
      },
      twitter: {
        type: [
          {
            name: String,
            description: String,
            score: Number,
          },
        ],
        default: [],
      },
    },

    userContentRemarks: {
      warpcast: {
        type: String,
      },
      twitter: {
        type: String,
      },
    },

    mintedValues: {
      type: [
        {
          value: {
            type: Schema.Types.ObjectId,
            ref: "Values",
          },
          weightage: Number,
        },
      ],
      default: [],
    },
    balance: {
      type: Number,
      default: 5,
    },
    userTxHashes: {
      type: [
        {
          txHash: String,
          createdAt: Date,
        },
      ],
      default: [],
    },
    profileNftIpfs: {
      type: String,
    },
    communitiesMinted: {
      type: [{type: Schema.Types.ObjectId, ref: "Communities"}],
      default: [],
    },

    attestations: {
      type: [String],
      default: [],
    },
    referrer: {
      type: String,
    },
    socialValuesMinted: {
      type: [String],
      default: [],
    },
  },

  {timestamps: true}
);

// Middleware to ensure uniqueness of wallets
userSchema.pre("save", async function (next) {
  const user = this;

  // Check for duplicates and remove them
  user.wallets = user.wallets.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  if (user.isNew) {
    const existingUser = await Users.findOne({email: user.email}).exec();
    if (existingUser) {
      return next();
    }
  }
  next();
});

const Users = models.Users || mongoose.model("Users", userSchema);
export default Users;
