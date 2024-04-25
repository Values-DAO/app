import mongoose, {Schema, models} from "mongoose";
export type IUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  wallets: string[];
  mintedValues: {value: string; txHash: string}[];
  balance: number;
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
  },
  {timestamps: true}
);

// Middleware to ensure uniqueness of wallets
userSchema.pre("save", function (next) {
  const user = this;
  // Check for duplicates and remove them
  user.wallets = user.wallets.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  next();
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
