import {NextRequest, NextResponse} from "next/server";
import connectToDatabase from "@/lib/connect-to-database";
import Identifier from "@/models/identifier";
import Users from "@/models/user";

import {v4 as uuidv4} from "uuid";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = uuidv4();

  try {
    const {fid} = await req.json();
    if (!fid) {
      logger.warn("Missing fid in request", {requestId});
      return NextResponse.json({error: "fid is required"}, {status: 400});
    }

    const createUserResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/users`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          fid,
          method: "create_user",
          referrer: "pregeneration_sep_19",
        }),
      }
    );
    const userCreationResponse = await createUserResponse.json();
    if (userCreationResponse.error) {
      logger.error("User creation failed", {
        requestId,
        fid,
        error: userCreationResponse.error,
      });
      return NextResponse.json(
        {error: userCreationResponse.error},
        {status: 500}
      );
    }
    logger.info("User created", {
      requestId,
      fid,
      userId: userCreationResponse.userId,
    });

    const userIdentifier = await Identifier.findOneAndUpdate(
      {userId: userCreationResponse._id},
      {userId: userCreationResponse._id},
      {upsert: true, new: true}
    );
    logger.info("User identifier updated", {
      requestId,
      userIdentifierId: userIdentifier._id,
    });

    logger.info("Generating user values", {requestId, fid});
    const generateValuesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/generate/values`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          userId: userCreationResponse.userId,
          farcaster: {fid},
          source: "farcaster",
        }),
      }
    );
    const values = await generateValuesResponse.json();
    console.log(values);
    if (!values.user) {
      logger.warn("No user values generated", {
        requestId,
        fid,
      });
      return NextResponse.json(
        {error: "No user values generated"},
        {status: 500}
      );
    }
    if (
      values?.user?.userContentRemarks?.warpcast ===
      "You have less than 100 tweets/casts."
    ) {
      logger.warn("User has less than 100 tweets/casts", {
        requestId,
        fid,
      });
      return NextResponse.json(
        {error: "You have less than 100 tweets/casts."},
        {status: 500}
      );
    }

    if (values?.user?.generatedValues?.warpcast.length > 0) {
      userIdentifier.valuesGenerated.warpcast = true;
      logger.info("Warpcast values generated", {
        requestId,

        fid,
      });
    }
    if (values?.user?.spectrum?.warpcast.length > 0) {
      userIdentifier.spectrum.warpcast = true;
      logger.info("Warpcast spectrum generated", {
        requestId,

        fid,
      });
    }

    userIdentifier.pregeneration.warpcast = true;
    await userIdentifier.save();
    logger.info("User identifier updated and saved", {
      requestId,

      fid,
    });

    logger.info("Request processed successfully", {
      requestId,
      fid,
    });

    return NextResponse.json(
      {user: userCreationResponse, message: "success"},
      {status: 200}
    );
  } catch (error) {
    logger.error("An error occurred", {
      requestId,
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json({error: "An error occurred"}, {status: 500});
  }
}
