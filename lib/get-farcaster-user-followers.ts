import {GraphQLClient} from "graphql-request";

interface FollowerData {
  SocialFollowers: {
    Follower: {
      fid: string;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      nextCursor: string;
    };
  };
}
export const getFarcasterUserFollowers = async ({
  username,
  fid,
}: {
  username?: string;
  fid?: string;
}) => {
  let hasNextPage = true;
  let nextCursor = "";

  let followers: number[] = [];

  const url = "https://api.airstack.xyz/graphql";
  const graphQLClient = new GraphQLClient(url, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  try {
    while (hasNextPage) {
      const query = `query GetFarcasterFollowers {
        SocialFollowers(
          input: {filter: {identity: {_eq: ${
            username ? `"fc_fname:${username}"` : `"fc_fid:${fid}"`
          }}, dappName: {_eq: farcaster}}, blockchain: ALL, limit: 200, cursor:${
        hasNextPage ? `"${nextCursor}"` : ""
      }}
        ) {
          Follower {
            fid:followerProfileId
          }
          pageInfo {
            hasNextPage
            nextCursor
          }
        }
      }`;

      const data: FollowerData = await graphQLClient.request(query);

      nextCursor = data.SocialFollowers.pageInfo.nextCursor;
      hasNextPage = data.SocialFollowers.pageInfo.hasNextPage;

      const followersList = data.SocialFollowers.Follower.map((follower) =>
        Number(follower.fid)
      );

      followers = followers.concat(followersList);
    }

    return followers;
  } catch (error) {
    console.error("Error fetching followers", error);
    return [];
  }
};
