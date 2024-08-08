import axios from "axios";
import {AIRSTACK_API_URL} from "./constants";

const FIDquery = (username: string) => {
  return `query GetFIDForUsername {
  Socials(input: {filter: {profileName: {_eq: "${username}"}}, blockchain: ethereum}) {
    Social {

      fid:userId
    }
  }
}`;
};

export const GetFIDForUsername = async (username: string) => {
  console.log(username);
  const query = FIDquery(username);
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
    if (data) {
      return data.data.Socials.Social[0].fid;
    }
    return null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
