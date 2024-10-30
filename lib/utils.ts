import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {IUser} from "@/types";

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