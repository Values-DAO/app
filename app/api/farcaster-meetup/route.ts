import connectToDatabase from "@/lib/connect-to-db";
import {FARCON_TICKETS} from "@/lib/constants";
import {fetchSocialsBulk} from "@/lib/fetch-farcaster-userinfo";
import getNFTHolders from "@/lib/get-nft-holders";
import FarcasterMeetup from "@/models/farcastermeetup";
import Farcon from "@/models/farcon";
import {headers} from "next/headers";
import {NextResponse} from "next/server";

export const POST = async (req: any) => {
  const headersList = headers();

  const apiKey = headersList.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({
      error: "Missing API key",
      status: 401,
    });
  }

  if (apiKey !== process.env.MASTER_API_KEY) {
    return NextResponse.json({
      error: "Invalid API key",
      status: 401,
    });
  }
  const fetchFarconSummitHolders = async () => {
    const attendees = [
      "0x3dbadfe41aa29fd69e541c34c372048c31725317",
      "0x86926b033bf15a05ee80e7510f6bf91671041400",
      "0xe2f0d0523f8dfcc80b544513fe38baedf5d19a2e",
      "0xeb9f398b901167f02a81db35efa098b6a5f4ff96",
      "0x18a6c90cc04b5e5a7d93ddede9b2ab62d9b50dd3",
      "0x406ee78ac844d9b7362ebe0c1a7adb1dfcb8b0b9",
      "0x0836bd43afb86063b17dca97c0dda213955e72cd",
      "0xc6e0a69c83cb57f6b4289c5fab04d4d807331f62",
      "0x94fc7e794334f03ffa6b55789e429a3d1954ac9f",
      "0x1a649ab5b0405b363f624d9c370ed74cbb33aa48",
      "0xdd335b39e00a7c0fd94fb5caad1f37fc9af9b2bd",
      "0xe2e5eff8a746855428c3d44979b2cd12564ba9aa",
      "0xd28234238fc366767b6ef5cbe7e538b987c721e1",
      "0x6cdd8ac8fa6a9276c5465fdbfac29c205fb28183",
      "0x0940c7de8ed6033ed7e3dcb456a882ae323228e3",
      "0xb4bb944ae3d691ec3a2e5db48f6255d342def31e",
      "0xdef7aaa7c2a836652fa9d488b8a33b7f09223c1d",
      "0x0dc002e9483474b5a0f4edcfa08a3a7284ade6d0",
      "0x74f42246f2cb65ec86b6ea43a8df27211c2aa89f",
      "0x83760d441dabc9ac87141a5d62ae8c371b26f124",
      "0x3d295f5cd5952f325650c7bd556872f25ec40d66",
    ];
    return attendees;
  };
  try {
    await connectToDatabase();
    const holders = await fetchFarconSummitHolders();

    const batchProcess = async (holders: string[]) => {
      const batchSize = 50;
      const socials = [];

      for (let i = 0; i < holders.length; i += batchSize) {
        const batch = holders.slice(i, i + batchSize);
        const batchSocials = await fetchSocialsBulk(batch);
        socials.push(...batchSocials);
      }

      return socials;
    };

    const socials = await batchProcess(holders);

    const users = await FarcasterMeetup.insertMany(socials);
    return NextResponse.json({count: users.length, users});
  } catch (error) {
    console.error("Error fetching farcon holders:", error);
    return NextResponse.json({error: error}, {status: 500});
  }
};
export const GET = async (req: any) => {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  try {
    await connectToDatabase();

    if (fid) {
      const user = await FarcasterMeetup.findOne({fid});
      if (!user) {
        return NextResponse.json({
          error: "User not found",
          status: 404,
          user: null,
          isHolder: false,
        });
      }
      return NextResponse.json({user, isHolder: true});
    }
    const users = await FarcasterMeetup.find({});
    return NextResponse.json({total: users.length, users});
  } catch (error) {
    return NextResponse.json({error: error}, {status: 500});
  }
};
