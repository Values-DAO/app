import {GraphQLClient} from "graphql-request";
type ResponseData = {
  FarcasterCasts: {
    Cast: {
      castedAtTimestamp: string;
      url: string;
      text: string;
      numberOfReplies: number;
      numberOfRecasts: number;
      numberOfLikes: number;
      fid: string;
      castedBy: {
        profileName: string;
      };
      channel: null | string;
    }[];
  };
};
export async function getLatestsCasts(fid: number) {
  const query = `query GetLatestCastsByFid {
  FarcasterCasts(input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: 3}) {
    Cast {
      castedAtTimestamp
      url
      text
      numberOfReplies
      numberOfRecasts
      numberOfLikes
      fid
      castedBy {
        profileName
      }
      channel {
        name
      }
    }
  }
}`;
  const url = "https://api.airstack.xyz/graphql";
  const graphQLClient = new GraphQLClient(url, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  const data: ResponseData = await graphQLClient.request(query);

  return data.FarcasterCasts.Cast;
}
