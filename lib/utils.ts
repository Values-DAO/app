import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {IUser} from "@/types";
import { z } from "zod";

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
});

export const formatISODate = (isoDate: Date) => {
    const dateObj = new Date(isoDate);  // Create a Date object

    const day = dateObj.getUTCDate();  // Get day (1-31)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[dateObj.getUTCMonth()];  // Get month name
    const year = dateObj.getUTCFullYear();  // Get year

    return `${day} ${month} ${year}`;
}