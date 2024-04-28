import {model, models, Schema} from "mongoose";
import User from "./user";

export type IInviteCodes = {
  code: string;
  claimedBy: string;
  claimed: boolean;
  codeOwner: string;
};

const inviteCodesSchema = new Schema({
  code: {
    type: String,
  },
  claimedBy: {
    type: String,
  },
  claimed: {
    type: Boolean,
    default: false,
  },
  codeOwner: {
    type: String,
  },
});
inviteCodesSchema.post("save", async function (doc, next) {
  try {
    const user = await User.findOne({email: doc.codeOwner});

    if (user) {
      const {inviteCodes} = user;

      const matchingInviteCode = inviteCodes.find(
        (inviteCode: {code: string; claimedBy: string; claimed: boolean}) =>
          inviteCode.code === doc.code
      );

      if (matchingInviteCode) {
        console.log("Matching invite code found:", matchingInviteCode);
        // Update the claimed and claimedBy fields of the matching invite code
        matchingInviteCode.claimed = true;
        matchingInviteCode.claimedBy = doc.claimedBy;
        // Save the user to persist the changes
        await user.save();
      }
    }
  } catch (error) {
    console.error("Error updating invite code:", error);
  }

  next();
});

const InviteCodes =
  models.InviteCodes || model<IInviteCodes>("InviteCodes", inviteCodesSchema);

export default InviteCodes;
