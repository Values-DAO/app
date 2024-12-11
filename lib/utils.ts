import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {IUser} from "@/types";
import { z } from "zod";
import { gql, useQuery } from "@apollo/client";
import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const calculateAverageScore = (scores: (number | undefined)[]): number => {
  const validScores = scores.filter(
    (score): score is number => score !== undefined
  );
  return validScores.length
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;
};

export const getSpectrumForUser = (user: IUser) => {
  const {warpcast, twitter} = user.spectrum;
  const maxLength = Math.max(warpcast?.length ?? 0, twitter?.length ?? 0);

  return Array.from({length: maxLength}, (_, i) => {
    const warpcastItem = warpcast?.[i];
    const twitterItem = twitter?.[i];
    return {
      name: warpcastItem?.name ?? twitterItem?.name ?? `Item ${i + 1}`,
      score: calculateAverageScore([warpcastItem?.score, twitterItem?.score]),
      description: warpcastItem?.description ?? twitterItem?.description ?? "",
    };
  });
};

export const formSchema = z.object({
  name: z.string().min(1, "Please provide a name").max(32, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  communityLink: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), "Invalid URL"),
  twitterHandle: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), "Invalid URL"),
  farcasterHandle: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), "Invalid URL"),
  organizerTwitterHandle: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+\..+/.test(val), "Invalid URL"),
  // tokenName: z.string().min(1, "Please provide a name").max(32, "Name is too long"),
  // tokenSymbol: z.string().min(1, "Please provide a symbol").max(8, "Symbol is too long"),
  // treasuryAllocation: z.string().min(1, "Please provide an allocation"),
});

export const formatISODate = (isoDate: Date) => {
    const dateObj = new Date(isoDate);  // Create a Date object

    const day = dateObj.getUTCDate();  // Get day (1-31)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[dateObj.getUTCMonth()];  // Get month name
    const year = dateObj.getUTCFullYear();  // Get year

    return `${day} ${month} ${year}`;
}

// @ts-ignore
export function calculateCommunityId(sender, name, symbol, blockNumber) {
  return keccak256(
    encodeAbiParameters(parseAbiParameters("address, string, string, uint256"), [sender, name, symbol, blockNumber])
  );
}


// GraphQL Query
export const GET_INITIALISED_EVENTS = gql`
  query GetInitialisedEvents(
    $first: Int = 10
    $skip: Int = 0
    $orderBy: Initialised_orderBy = blockTimestamp
    $orderDirection: OrderDirection = desc
  ) {
    initialiseds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      creator
      name
      symbol
      createdTokenAddy
      communityId
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Hook or Function to use the query
export function useInitialisedEvents() {
  const { loading, error, data } = useQuery(GET_INITIALISED_EVENTS, {
    variables: {
      first: 10, // Adjust as needed
      skip: 0,
    },
  });

  return {
    initialisedEvents: data?.initialiseds || [],
    loading,
    error,
  };
}

// If you want to get a specific communityId
export const GET_INITIALISED_EVENT_BY_COMMUNITY_ID = gql`
  query GetInitialisedEventByCommunityId($communityId: Bytes!) {
    initialiseds(where: { communityId: $communityId }, first: 1) {
      id
      creator
      name
      symbol
      createdTokenAddy
      communityId
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// Function to fetch a specific communityId
export function useInitialisedEventByCommunityId(communityId: string) {
  const { loading, error, data } = useQuery(GET_INITIALISED_EVENT_BY_COMMUNITY_ID, {
    variables: { communityId },
  });

  return {
    initialisedEvent: data?.initialiseds[0] || null,
    loading,
    error,
  };
}


