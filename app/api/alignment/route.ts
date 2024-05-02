import connectToDatabase from "@/lib/connect-to-db";
import User, {IUser} from "@/models/user";
import {NextResponse} from "next/server";

export const GET = async (req: any) => {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  const currentUserEmail = searchParams.get("email");

  if (!fid || !currentUserEmail)
    return NextResponse.json({error: "Missing parameters", status: 400});

  try {
    await connectToDatabase();
    const user: IUser | null = await User.findOne({email: currentUserEmail});

    const partner: IUser | null = await User.findOne({farcaster: fid});

    if (!user || !partner) {
      return NextResponse.json({error: "User not found", status: 404});
    }

    const sourceValues = user.mintedValues.map((item) => item.value);
    const partnerValues = partner.mintedValues.map((item) => item.value);

    const intersection = sourceValues.filter((value) =>
      partnerValues.includes(value)
    );

    const union = Array.from(new Set([...sourceValues, ...partnerValues]));

    const percentageAlignment = (intersection.length / union.length) * 100;

    return NextResponse.json({alignment: percentageAlignment, status: 200});
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
};
