import axios from "axios";
import {AIRSTACK_API_URL} from "./constants";

export const fetchCastsForUser = async (
  fid: number | string,
  limit: number
) => {
  const query = `
    query MyQuery {
        FarcasterCasts(
            input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: ${limit}}
        ) {
            Cast {
            rawText
            }
        }
    }`;

  const airstackResponse = await axios.post(
    AIRSTACK_API_URL,
    {
      query,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
      },
    }
  );

  const casts = airstackResponse.data.data.FarcasterCasts.Cast.map(
    (cast: any) => {
      return cast.rawText;
    }
  );

  return casts;
};
