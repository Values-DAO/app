import axios from "axios";

export async function getFarcasterUserImage(fid: string | number) {
  const query = `
    query GetUserForFID {
  Socials(
    input: {filter: {userId: {_eq: "${fid}"}, dappName: {_eq: farcaster}}, blockchain: ethereum}
  ) {
    Social {
      profileName
      profileImage
    }
  }
}
  `;

  const AIRSTACK_API_URL = "https://api.airstack.xyz/graphql";
  try {
    const {data} = await axios.post(
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

    return data.data.Socials.Social[0].profileImage;
  } catch (error) {
    console.log("error", error);
  }
}
