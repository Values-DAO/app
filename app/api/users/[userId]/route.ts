import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import Values from "@/models/values";
import {NextRequest, NextResponse} from "next/server";

export async function GET(
  req: NextRequest,
  params: {
    params: {
      userId: string;
    };
  }
) {
  const {userId} = params.params;
  if (!userId) {
    return NextResponse.json({error: "Please provide userId"});
  }

  try {
    await connectToDatabase();

    const user = await Users.findOne({
      userId,
    });
    if (!user) {
      return NextResponse.json({
        error: "User not found",
      });
    }
    return NextResponse.json({
      userId: user.userId,
      ...(user.fid && {fid: user.fid}),
      ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
      ...(user.twitterId && {twitterId: user.twitterId}),
      ...(user.email && {email: user.email}),
      ...(user.wallets && {wallets: user.wallets}),
      wallets: user.wallets,
      profileMinted: user.profileMinted,
      profileNft: user.profileNft,
      balance: user.balance,
      mintedValues: (
        await user.populate("mintedValues.value")
      ).mintedValues.map((v: any) => ({
        name: v.value.name,
        weightage: v.weightage,
      })),
      generatedValues: user.generatedValues,
      generatedValuesWithWeights: user.generatedValuesWithWeights,
      spectrum: user.spectrum,
      socialValuesMinted: user.socialValuesMinted,
      communitiesMinted: user.communitiesMinted,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(error);
  }
}
