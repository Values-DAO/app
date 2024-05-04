import mongoose, {Schema, models} from "mongoose";

export type IUser = {
  name?: string;
  username?: string;
  email?: string;
  farcaster?: number;
  wallets?: string[];
  mintedValues: {value: string; txHash: string}[];
  balance?: number;
  invitedBy?: string;
  isVerified?: boolean;
  totalInvites?: number;
  inviteCodes?: {code: string; claimedBy: string; claimed: boolean}[];
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
      unique: true,
    },
    farcaster: {
      type: Number,
      unique: true,
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
  next();
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
