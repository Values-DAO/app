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
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${fid}&includeweights=true`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      }
    );

    if (data.status === 400) {
      await sendDirectCast({
        recipientFid: Number(fid),
        message: `gm\nYou have less than 100 casts. We need atleast 100 casts to meaningfully generate your values. Please cast more to generate your values.`,
      });
      return NextResponse.json({
        status: 400,
        error: "User has less than 100 casts",
      });
    }

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
          message: `gm\n\nValuesDAO is on a mission to create a more aligned world.\n\nCurrently, there is no way to know your Values.\n\nWe have an experimental AI model that takes your content and finds Values.\n\nWhile it will take months or even years to be completely accurate, it works very well in practice.\n\nHere are your Values:\n${data?.user?.aiGeneratedValues?.warpcast
            ?.map((value: string) => `* ${value}`)
            .join(
              "\n"
            )}\n\nBased on these Values, we will find the top 3 people you should meet at EthCC week in a few days.\n\nWe are a bootstrapped team of 2 building this project. Please help us reach everyone at EthCC.\n\nClick to cast: https://warpcast.com/~/compose?text=I%20just%20minted%20my%20Values%0A%0ATo%20find%20value-aligned%20folks%20at%20EthCC,%20use%20this%20frame&embeds[]=${
            process.env.NEXT_PUBLIC_HOST
          }/api/v2/ethcc/success?fid=${fid}`,
        });
      }

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

export const GET = POST;
