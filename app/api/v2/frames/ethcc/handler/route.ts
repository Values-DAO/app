import {NFT_CONTRACT_ADDRESS} from "@/constants";
import connectToDatabase from "@/lib/connect-to-db";
import {sendDirectCast} from "@/lib/direct-cast";
import {fetchFarcasterUserWallets} from "@/lib/fetch-farcaster-user-wallets";
import ETHCCAttendee from "@/models/ethcc";
import axios from "axios";
import {NextResponse} from "next/server";

export async function POST(req: any) {
  const {fid} = await req.json();

  if (!fid) return NextResponse.json({status: 400, error: "Missing fid"});

  try {
    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${fid}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      }
    );

    console.log("data", data);

    if (data.status === 200) {
      console.log("Generated values for user", fid);

      //mint the profile with values

      const wallets = await fetchFarcasterUserWallets(fid);
      if (wallets) {
        console.log("Fetched wallets for user", fid, wallets);
        console.log({
          farcaster: fid,
          method: "mint_profile",
          wallets: wallets,
          values: data?.user?.aiGeneratedValues?.warpcast?.map(
            (value: string) => ({
              name: value,
              newWeightage: "1",
            })
          ),
        });
        const MintProfileResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
          {
            farcaster: fid,
            method: "mint_profile",
            wallets: wallets,
            values: data?.user?.aiGeneratedValues?.warpcast?.map(
              (value: string) => ({
                name: value,
                newWeightage: "1",
              })
            ),
          },
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
            },
          }
        );
        console.log("MintProfileResponse", MintProfileResponse.data);
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

        await sendDirectCast({
          recipientFid: Number(fid),
          message: `gm\nWe analysed your warpcast and minted your values. Here are your values:\n${data?.user?.aiGeneratedValues?.warpcast
            ?.map((value: string) => `* ${value}`)
            .join(
              "\n"
            )}\nWe will direct cast you with top 3 aligned folks for you whom you should meet at ETHCC week.
               \n\nClick to cast: https://warpcast.com/~/compose?text=I%20just%20minted%20my%20values%20at%20ValuesDAO,%20if%20you%20are%20coming%20to%20ETHCC,%20mint%20your%20values%20and%20find%20your%20aligned%20folks%20&embeds[]=${
                 process.env.NEXT_PUBLIC_HOST
               }/api/v2/frames/ethcc/success?fid=${fid}`,
        });
      }
      console.log("Minted profile for user", fid);
      await connectToDatabase();
      await ETHCCAttendee.create({
        fid: fid,
      });
      return NextResponse.json({
        status: 200,
        message: "success",
      });
    } else {
      return NextResponse.json({
        status: 500,
        error: "Error generating user value",
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: "Error generating user value",
    });
  }
}
