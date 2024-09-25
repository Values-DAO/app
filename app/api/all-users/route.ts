import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";

import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortField = searchParams.get("sortField") || "userId";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const privyId = searchParams.get("privyId") || "";
  const admins = process.env.ADMINS!.split(",");

  if (!admins.includes(privyId)) {
    return NextResponse.json({
      error: true,
      message: "Unauthorized",
    });
  }
  const skip = (page - 1) * limit;

  await connectToDatabase();

  const filter = search
    ? {
        $or: [
          {userId: {$regex: search, $options: "i"}},
          {email: {$regex: search, $options: "i"}},
          {twitterUsername: {$regex: search, $options: "i"}},
        ],
      }
    : {};

  const sort = {[sortField]: sortOrder === "asc" ? 1 : -1};

  const users = await Users.find(filter)
    .select(
      "-_id userId email fid twitterUsername twitterId wallets generatedValuesWithWeights spectrum mintedValues communitiesMinted referrer socialValuesMinted createdAt"
    )

    .sort(sort as any)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Users.countDocuments(filter);

  return NextResponse.json({
    users,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
