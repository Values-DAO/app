import {AIRSTACK_API_URL} from "@/constants";
import {gql, GraphQLClient} from "graphql-request";
import {isAddress} from "viem";
type FarcasterSocialData = {
  Socials: {
    Social: {
      connectedAddresses: {
        address: string;
      }[];
    }[];
  };
};
export const getUserFarcasterWallets = async (fid: number) => {
  const query = gql`
      query MyQuery {
        Socials(
          input: {
            filter: {userId: {_eq: "${fid}"}, dappName: {_eq: farcaster}}
            blockchain: ethereum
          }
        ) {
          Social {
            connectedAddresses {
              address
              blockchain
            }
          }
        }
      }
    `;

  const graphQLClient = new GraphQLClient(AIRSTACK_API_URL, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  try {
    const data: FarcasterSocialData = await graphQLClient.request(query);

    return data.Socials.Social[0].connectedAddresses
      .filter(({address}) => isAddress(address))
      .map(({address}) => address);
  } catch (error) {
    return [];
  }
};
