import connectToDatabase from "@/lib/connect-to-database";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import {generateUserValues} from "@/lib/generate-user-values";
import Users from "@/models/user";
import Values from "@/models/values";
import {generateEmailHTML, sendMail} from "@/service/email";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const {userId, farcaster, twitter, source} = await req.json();

  if (!userId) {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'userId' must be a string.",
    });
  }
  if (source !== "twitter" && source !== "farcaster") {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'source' must be either 'twitter' or 'farcaster'.",
    });
  }
  if (
    (source === "farcaster" && !farcaster?.fid) ||
    (source === "twitter" && !twitter.id && !twitter.username)
  ) {
    return NextResponse.json({
      status: 400,
      error:
        "Invalid input: 'farcaster.fid' or ('twitter.id' and 'twitter.username') must be provided.",
    });
  }

  try {
    await connectToDatabase();
    const user = await Users.findOne({userId});

    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found.",
      });
    }
    if (
      user.userContentRemarks &&
      user.userContentRemarks[
        source === "farcaster" ? "warpcast" : "twitter"
      ] === "You have less than 100 tweets/casts."
    ) {
      return NextResponse.json({
        status: 500,
        error: "You have less than 100 tweets/casts.",
      });
    }
    if (
      user.generatedValues &&
      user.generatedValues[source === "farcaster" ? "warpcast" : "twitter"]
        .length > 0
    ) {
      return NextResponse.json({
        status: 200,
        message: "success",
        user: {
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
          ...(user.mintedValues.length > 0 && {
            mintedValues: (
              await user.populate("mintedValues.value")
            ).mintedValues.map((v: any) => ({
              name: v.value.name,
              weightage: v.weightage,
            })),
          }),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        },
      });
    }
    // fetch user tweets or casts
    let userContent: string[] | any = [];
    if (source === "farcaster" && farcaster?.fid) {
      userContent = await fetchCastsForUser(farcaster?.fid, 100);
    } else {
      userContent = await fetchUserTweets(twitter.id, 1);
    }

    if (userContent.error) {
      return NextResponse.json({
        status: 500,
        error: userContent.error,
      });
    }
    if (userContent.length < 90) {
      user.userContentRemarks[source === "farcaster" ? "warpcast" : "twitter"] =
        "You have less than 100 tweets/casts.";
      await user.save();
      return NextResponse.json({
        status: 500,
        error: "You have less than 100 tweets/casts.",
      });
    }

    //now generate the values
    const generatedValues = await generateUserValues(userContent);

    if (generatedValues && generatedValues.error) {
      return NextResponse.json({
        status: 500,
        error: generatedValues.error || "Error generating user values",
      });
    }

    if (source === "farcaster") {
      user.generatedValues.warpcast = generatedValues.topValues.map((value) =>
        value.toLowerCase()
      );
      user.generatedValuesWithWeights.warpcast = generatedValues.userValues;
      user.spectrum.warpcast = generatedValues.userSpectrum;
    }
    if (source === "twitter") {
      user.generatedValues.twitter = generatedValues.topValues.map((value) =>
        value.toLowerCase()
      );
      user.generatedValuesWithWeights.twitter = generatedValues.userValues;
      user.spectrum.twitter = generatedValues.userSpectrum;
    }

    await user.save();

    await sendMail(
      `Values generated via AI`,
      generateEmailHTML({
        action: "USER_VALUES_GENERATED",
        fid: user?.fid,
        email: user.email,
        twitter: user.twitterUsername,
        generatedValues:
          user.generatedValues[source === "farcaster" ? "warpcast" : "twitter"],
        source,
        spectrum:
          user.spectrum[source === "farcaster" ? "warpcast" : "twitter"],
      })
    );
    return NextResponse.json({
      status: 200,
      message: "success",
      user: {
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
        ...(user.mintedValues.length > 0 && {
          mintedValues: (
            await user.populate("mintedValues.value")
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
        }),
        generatedValues: user.generatedValues,
        generatedValuesWithWeights: user.generatedValuesWithWeights,
        spectrum: user.spectrum,
        socialValuesMinted: user.socialValuesMinted,
        communitiesMinted: user.communitiesMinted,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error || "Internal server error.",
    });
  }
}
