import connectToDatabase from "@/lib/connect-to-db";
import {FARCON_TICKETS} from "@/lib/constants";
import {fetchSocialsBulk} from "@/lib/fetch-farcaster-userinfo";
import getNFTHolders from "@/lib/get-nft-holders";
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
    const holders = [];
    const summitPassHolders = await getNFTHolders(FARCON_TICKETS.summit);
    holders.push(...summitPassHolders);

    const communityPassHolders = await getNFTHolders(FARCON_TICKETS.community);
    holders.push(...communityPassHolders);

    const vibesPassHolders = await getNFTHolders(FARCON_TICKETS.vibes);
    holders.push(...vibesPassHolders);
    return holders;
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

    const users = await Farcon.insertMany(socials);
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
      const user = await Farcon.findOne({fid});
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
    const users = await Farcon.find({});
    return NextResponse.json({total: users.length, users});
  } catch (error) {
    return NextResponse.json({error: error}, {status: 500});
  }
};
