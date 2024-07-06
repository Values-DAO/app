import {GraphQLClient} from "graphql-request";
interface FollowerData {
  SocialFollowers: {
    Follower: {
      fid: string;
    }[];
  };
}
export const getFarcasterUserFollowers = async (username: string) => {
  const query = `query GetFarcasterFollowers {
    SocialFollowers(
      input: {filter: {identity: {_eq: "fc_fname:${username}"}, dappName: {_eq: farcaster}}, blockchain: ALL, limit: 50}
    ) {
      Follower {

        fid:followerProfileId
        
      }
    }
  }`;

  const url = "https://api.airstack.xyz/graphql";
  const graphQLClient = new GraphQLClient(url, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  try {
    const data: FollowerData = await graphQLClient.request(query);

    return data.SocialFollowers.Follower.map((follower) =>
      Number(follower.fid)
    );
  } catch (error) {
    console.error("Error fetching followers", error);
    return [];
  }
};
