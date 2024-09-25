import {AIRSTACK_API_URL} from "@/constants";
import {GraphQLClient} from "graphql-request";
type FarcasterSocialData = {
  Socials: {
    Social: {
      profileName: string;
      profileHandle: string;
    }[];
  };
};
export async function getFarcasterUser(fid: number) {
  const query = `query GetFarcasterUsername {
  Socials(
    input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
  ) {
    Social {
      profileHandle
      profileName
    }
  }
}`;

  const graphQLClient = new GraphQLClient(AIRSTACK_API_URL, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  try {
    const data: FarcasterSocialData = await graphQLClient.request(query);

    return data.Socials.Social[0];
  } catch (error) {
    return {};
  }
}
