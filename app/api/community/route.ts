import connectToDatabase from "@/lib/connect-to-database";
import Communities from "@/models/community";
import Values from "@/models/values";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid";
export async function POST(req: NextRequest) {
  const {name, values, verifiedCommunity, communityTokens, valuesSource, slug} =
    await req.json();

  if (!name) {
    return NextResponse.json({error: "Name is required"});
  }
  if (!values || values.length === 0) {
    return NextResponse.json({error: "Values are required"});
  }
  if (!slug) {
    return NextResponse.json({error: "Slug is required"});
  }

  if (!communityTokens || communityTokens.length === 0) {
    return NextResponse.json({error: "Community tokens are required"});
  }

  try {
    await connectToDatabase();

    const allValues = await Values.find();
    const communityValueIds = [];
    for (const value of values) {
      const valueId = allValues.find(
        (val) => val.name === value.toLowerCase()
      )?._id;
      if (valueId) {
        communityValueIds.push(valueId);
        continue;
      }
      if (!allValues.find((val) => val.name === value.toLowerCase())) {
        const Value = await Values.create({
          name: value,
          valueId: `value_${uuidv4()}`,
        });
        communityValueIds.push(Value._id);
      }
    }

    for (const token of communityTokens) {
      if (
        !token.tokenType ||
        !token.tokenContractAddress ||
        !token.tokenChainId
      ) {
        return NextResponse.json({
          error:
            "Token type, token contract address and token chain id are required",
        });
      }
    }
    const community = await Communities.create({
      name,
      values: communityValueIds,
      verifiedCommunity,
      communityTokens,
      ...(valuesSource && {valuesSource}),
      slug: slug.toLowerCase().replace(/ /g, "-"),
      communityId: `community_${uuidv4()}`,
    });

    return NextResponse.json(community);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({error: "Duplicate key error"});
    } else {
      console.error(error);
      return NextResponse.json(error);
    }
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const communities = await Communities.find().populate("values");
    return NextResponse.json(communities);
  } catch (error) {
    return NextResponse.json(error);
  }
}
