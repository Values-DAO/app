import {IUser} from "@/types";

type SpectrumItem = {
  name: string;
  score: number;
  description: string;
};

const calculateAverageScore = (scores: (number | undefined)[]): number => {
  const validScores = scores.filter(
    (score): score is number => score !== undefined
  );
  return validScores.length
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;
};

const getSpectrumForUser = (user: IUser): SpectrumItem[] => {
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

const calculateAlignmentScore = (user: IUser, targetUser: IUser) => {
  const userSpectrum = getSpectrumForUser(user);
  const targetSpectrum = getSpectrumForUser(targetUser);

  const totalDifference = userSpectrum.reduce((sum, item, i) => {
    const difference = Math.abs(item.score - (targetSpectrum[i]?.score ?? 0));
    return sum + difference;
  }, 0);

  const avgDifference = totalDifference / userSpectrum.length;

  const alignmentScore = 100 - avgDifference;

  return alignmentScore.toFixed(2);
};

export default calculateAlignmentScore;
