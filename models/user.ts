import mongoose, {Schema, models} from "mongoose";

export type IUser = {
  name?: string;
  profileNft?: Number;
  email?: string;
  farcaster?: number;
  twitter?: string;
  wallets?: string[];
  mintedValues?: {value: string; weightage?: Number}[];
  balance?: number;
  aiGeneratedValues?: {
    twitter: string[];
    warpcast: string[];
  };
  aiGeneratedValuesWithWeights?: {
    twitter: Object;
    warpcast: Object;
  };
  profileNftHash?: string;
  profileNftIpfs?: string;
  communitiesMinted?: string[];
  referrer?: string;
  attestations?: string[];
  spectrums?: {
    warpcast: {name: string; description: string; score: number}[];
    twitter: {name: string; description: string; score: number}[];
  };
};

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    profileNft: {
      type: Number,
    },

    email: {
      type: String,
    },
    farcaster: {
      type: Number,
    },
    twitter: {
      type: String,
    },

    wallets: {
      type: [String],
      default: [],
    },
    mintedValues: {
      type: [
        {
          value: String,
          weightage: Number,
        },
      ],
      default: [],
    },

    aiGeneratedValues: {
      twitter: {
        type: [String],
        default: [],
      },
      warpcast: {
        type: [String],
        default: [],
      },
    },
    aiGeneratedValuesWithWeights: {
      twitter: {type: Object, default: {}},
      warpcast: {type: Object, default: {}},
    },
    balance: {
      type: Number,
      default: 0,
    },
    profileNftHash: {
      type: String,
    },
    profileNftIpfs: {
      type: String,
    },
    communitiesMinted: {
      type: [String],
      default: [],
    },
    referrer: {
      type: String,
    },
    attestations: {
      type: [String],
      default: [],
    },
    spectrums: {
      warpcast: {
        type: [
          {
            name: {
              type: String,
              required: true,
            },
            description: {
              type: String,
              required: false,
            },
            score: {
              type: Number,
              required: true,
            },
          },
        ],
        default: [],
      },
      twitter: {
        type: [
          {
            name: {
              type: String,
              required: true,
            },
            description: {
              type: String,
              required: false,
            },
            score: {
              type: Number,
              required: true,
            },
          },
        ],
        default: [],
      },
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
    const existingUser = await User.findOne({email: user.email}).exec();
    if (existingUser) {
      return next();
    }
  }
  next();
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
