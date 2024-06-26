import {sendDirectCast} from "@/lib/direct-cast";
import {fetchFarcasterUserWallets} from "@/lib/fetch-farcaster-user-wallets";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const {fid} = await req.json();
  if (!fid) return NextResponse.json({status: 400, error: "Missing fid"});
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${fid}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      }
    );
    if (response.data.status === 200) {
      console.log("Generated values for user", fid);

      //values are generated for the user
      const wallets: string[] = await fetchFarcasterUserWallets(fid);
      console.log("Fetched wallets for user", fid, wallets);
      const MintProfileResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
        {
          farcaster: fid,
          method: "mint_profile",
          wallets,
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      );
      console.log("Minted profile for user", fid, MintProfileResponse.data);
      if (MintProfileResponse.data.status !== 200) {
        console.error(
          "Error minting profile for user",
          fid,
          MintProfileResponse.data
        );
        return NextResponse.json({
          status: MintProfileResponse.data.status,
          error: MintProfileResponse.data.error,
        });
      }
      console.log({
        farcaster: fid,
        method: "update_profile",
        values: response?.data?.user?.aiGeneratedValues?.warpcast?.map(
          (value: string) =>
            ({
              name: value,
              weightage: "1",
            } ?? [])
        ),
      });
      const updateProfileWithValuesResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
        {
          farcaster: fid,
          method: "update_profile",
          values: response?.data?.user?.aiGeneratedValues?.warpcast?.map(
            (value: string) =>
              ({
                name: value,
                weightage: "1",
              } ?? [])
          ),
          type: "community",
          communityId: "warpcast",
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      );

      if (updateProfileWithValuesResponse.data.status !== 200) {
        console.error(
          "Error updating profile with values for user",
          fid,
          updateProfileWithValuesResponse.data
        );
        return NextResponse.json({
          status: updateProfileWithValuesResponse.data.status,
          error: updateProfileWithValuesResponse.data.error,
        });
      }

      //* update the cast content
      if (updateProfileWithValuesResponse.data.status === 200) {
        await sendDirectCast({
          recipientFid: Number(fid),
          message: [
            "gm",
            "We have analysed your warpcast casts and minted your value profile",
            response?.data?.user?.aiGeneratedValues?.warpcast?.map(
              (value: string) => `* ${value}`
            ),
            `Click to cast: https://warpcast.com/~/compose?text=I%20just%20minted%20values%20on%20ValuesDAO,%20check%20out%20yours%20at%20app.valuesdao.io%20&embeds[]=${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ai/success?fid=${fid}`,
          ].join("\n"),
        });
      }
      // now find their wallets connected to farcaster
      // call POST /user with mint_profile method and mint the values
      return NextResponse.json({
        status: 200,
        message: "Generated values for user",
        values: response.data.user.aiGeneratedValues.warpcast,
      });
    }

    return NextResponse.json({
      status: response.data.status,
      error: response.data.error,
    });
  } catch (error) {
    console.error("Error generating user value", error);
    return NextResponse.json({
      status: 500,
      error: "Error generating user value",
    });
  }
}
