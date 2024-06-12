import axios, {AxiosRequestConfig} from "axios";

interface DirectCastData {
  recipientFid: number;
  message: string;
}

const generateIdempotencyKey = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
export const sendDirectCast = async (data: DirectCastData): Promise<void> => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.WARPCAST_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.put(
      "https://api.warpcast.com/v2/ext-send-direct-cast",
      {
        recipientFid: data.recipientFid,
        message: data.message,
        idempotencyKey: generateIdempotencyKey(),
      },
      config
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
};
