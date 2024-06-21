import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";

import {sendDirectCast} from "@/lib/direct-cast";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    console.log("New request to generate user values");
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const fid = searchParams.get("fid");

    if (!fid) {
      console.log("Farcaster fid is required");
      return NextResponse.json({
        status: 400,
        error: "farcaster fid is required",
      });
    }

    let generatedValues: string[] = [];
    let user = await User.findOne({farcaster: fid});
    if (
      user &&
      user?.aiGeneratedValues?.warpcast &&
      user?.aiGeneratedValues?.warpcast.length > 0
    ) {
      console.log("User already has generated values", fid);
      generatedValues = user.aiGeneratedValues.warpcast;
    } else {
      const casts = await fetchCastsForUser(fid, 200);
      if (casts.length < 100) {
        console.log("User has less than 100 casts", Number(fid));
        await sendDirectCast({
          recipientFid: Number(fid),
          message:
            "You have less than 100 casts. We would require at least 100 casts to meaningfully generate your values using AI. Visit https://app.valuesdao.io to manually mint your values.",
        });
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 casts",
        });
      }
      generatedValues = (await generateValuesForUser(casts)) ?? [];
      await user.create({
        farcaster: fid,
        aiGeneratedValues: {
          warpcast: Array.from(generatedValues),
        },
      });
      console.log("Generated values for user", fid);
    }

    console.log("sending a direct cast to the user", fid);
    await sendDirectCast({
      recipientFid: Number(fid),
      message: [
        "gm",
        "We have analysed your warpcast casts and generated your values",
        ...generatedValues.map((value) => `* ${value}`),
        `Mint your values; ${process.env.NEXT_PUBLIC_HOST}/frames/ai/mint-values/${fid}`,
      ].join("\n"),
    });

    await axios.post(
      `${process.env.NEXT_PUBLIC_HOST}/api/batch-upload-pinata`,
      {
        values: generatedValues,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.NEXT_PUBLIC_NEXT_API_KEY}`,
        },
      }
    );
    return NextResponse.json({
      status: 200,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
