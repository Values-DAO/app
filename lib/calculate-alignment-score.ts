import {IUser} from "@/types";

export default function calculateAlignmentScore(
  user: IUser,
  targetUser: IUser
): string {
  const userSpectrum = user.spectrum.warpcast ?? [];
  const targetSpectrum = targetUser.spectrum.warpcast ?? [];

  let sumOfDifferences = 0;
  for (let i = 0; i < userSpectrum.length; i++) {
    const userSpectrumScore = userSpectrum[i].score;
    const targetSpectrumScore = targetSpectrum[i].score;

    sumOfDifferences += Math.abs(userSpectrumScore - targetSpectrumScore);
  }
  const avgDifference = sumOfDifferences / userSpectrum.length;
  const alignmentScore = 100 - avgDifference;

  return alignmentScore.toFixed(2);
}
