import { API_BASE_URL } from "@/constants";
import axios from "axios";

export const createNewTrustPool = async (values: any, decodedLogs: any, userId: string) => {
  const response = await axios.post(`${API_BASE_URL}/trustpools/new`, {
    ...values,
    tokenAddress: decodedLogs?.args.tokenAddress,
    bondingCurveAddress: decodedLogs?.args.bondingCurveAddress,
    userId,
  });
  
  if (response.status !== 200) {
    throw new Error("Failed to create new trust pool.");
  }
  
  return response.data.data._id;
}