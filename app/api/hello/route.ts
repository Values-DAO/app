import {fetchAllNFTsValuesDAO} from "@/lib/fetch-all-nfts-valuesdao";
import {NextResponse} from "next/server";

export async function GET() {
  try {
    const data = await fetchAllNFTsValuesDAO();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({error: error}, {status: 500});
  }
}
