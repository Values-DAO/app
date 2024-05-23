import mongoose, {Schema, models} from "mongoose";

export type IUser = {
  name?: string;
  username?: string;
  email?: string;
  farcaster?: number;
  twitter?: string;
  wallets?: string[];
  mintedValues?: {value: string; txHash: string}[];
  balance?: number;
  invitedBy?: string;
  isVerified?: boolean;
  totalInvites?: number;
  inviteCodes?: {code: string; claimedBy: string; claimed: boolean}[];
  generatedValues?: string[];
  aiGeneratedValues?: {
    twitter: string[];
    warpcast: string[];
  };
};

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
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
          txHash: String,
        },
      ],
      default: [],
    },
    // deprecated
    generatedValues: {
      type: [String],
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
    balance: {
      type: Number,
      default: 0,
    },
    invitedBy: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalInvites: {
      type: Number,
      default: 0,
    },
    inviteCodes: {
      type: [
        {
          code: String,
          claimedBy: {
            type: String,
            required: false,
          },
          claimed: {
            type: Boolean,
            default: false,
          },
        },
      ],
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
    const existingUser = await User.findOne({email: user.email}).exec();
    if (existingUser) {
      return next();
    }
  }
  next();
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
