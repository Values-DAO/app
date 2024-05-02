import {gql, GraphQLClient} from "graphql-request";
interface IResponse {
  Socials: Socials;
}
interface Socials {
  Social: [
    {
      username: string;
      fid: string;
      address: string[];
      image: string;
    }
  ];
}

export const fetchSocialsBulk = async (addresses: string[]) => {
  const query = gql`
  query MyQuery {
    Socials(
      input: {
        filter: {
          userAssociatedAddresses: {
            _in: ${JSON.stringify(addresses)}
          }
          dappName: {_eq: farcaster}
        }
        blockchain: ethereum
      }
    ) {
      Social {
        fid:userId
        username:profileName
        address:userAssociatedAddresses
        image:profileImage
      }
    }
  }
`;

  const url = "https://api.airstack.xyz/graphql";
  const graphQLClient = new GraphQLClient(url, {
    headers: {
      Authorization: process.env.AIRSTACK_API_KEY || "",
    },
  });

  try {
    const data: IResponse = await graphQLClient.request(query);

    return data.Socials.Social;
  } catch (error) {
    return [];
  }
};
