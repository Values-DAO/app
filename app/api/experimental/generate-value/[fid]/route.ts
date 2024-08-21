import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesWithSpectrumForUser} from "@/lib/generate-user-values-per-casts";
import {openai} from "@/lib/openai";
import {useParams} from "next/navigation";
import {NextResponse} from "next/server";

export async function GET(
  req: any,
  params: {
    params: {
      fid: string;
    };
  }
) {
  const {fid} = params.params;

  const casts = await fetchCastsForUser(fid, 100);
  if (casts.length < 100) {
    return NextResponse.json({
      fid,
      casts,
      error: "User has less than 100 casts",
    });
  }

  const data = await generateValuesWithSpectrumForUser(casts);

  return NextResponse.json({fid, data});
}
