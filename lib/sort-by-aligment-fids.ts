import User from "@/models/user";
import axios from "axios";
import calculateAlignmentScore from "./calculate-alingment-score";

export async function sortByAlignmentFids({
  fids,
  userFID,
}: {
  fids: number[];
  userFID: number;
}) {
  if (fids.length === 0) {
    return [];
  }
  let users = [];
  const {data: userData} = await axios.get(
    `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${userFID}&includeweights=true`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
      },
    }
  );

  let user = {
    fid: userFID,
    generatedValues:
      typeof userData?.user?.aiGeneratedValuesWithWeights?.warpcast ===
        "undefined" ||
      Object.keys(userData?.user?.aiGeneratedValuesWithWeights?.warpcast || {})
        .length === 0 ||
      typeof userData?.user?.aiGeneratedValues?.warpcast === "undefined"
        ? {
            ...userData?.user?.aiGeneratedValues?.warpcast?.reduce(
              (acc: Record<string, number>, value: string) => {
                acc[value] = 100;
                return acc;
              },
              {}
            ),
            ...userData?.user?.aiGeneratedValues?.twitter?.reduce(
              (acc: Record<string, number>, value: string) => {
                acc[value] = 100;
                return acc;
              },
              {}
            ),
          }
        : {
            ...userData?.user?.aiGeneratedValuesWithWeights?.warpcast,
            ...userData?.user?.aiGeneratedValuesWithWeights?.twitter,
          },
  };
  for (const fid of fids) {
    const {data: response} = await axios.get(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${fid}&includeweights=true`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      }
    );

    let targetUser = response.user;

    let targetUserObject = {
      fid,

      generatedValues:
        typeof targetUser?.aiGeneratedValuesWithWeights?.warpcast ===
          "undefined" ||
        Object.keys(targetUser?.aiGeneratedValuesWithWeights?.warpcast)
          .length === 0 ||
        targetUser?.aiGeneratedValuesWithWeights?.warpcast === "undefined"
          ? {
              ...targetUser?.aiGeneratedValues?.warpcast?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
              ...targetUser?.aiGeneratedValues?.twitter?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
            }
          : {
              ...targetUser?.aiGeneratedValuesWithWeights?.warpcast,
              ...targetUser?.aiGeneratedValuesWithWeights?.twitter,
            },
    };
    users.push(targetUserObject);
  }

  const scores = calculateAlignmentScore(user, users);
  const recommendations = scores.alignmentScores.map((score) => {
    return {
      fid: score.fid,
      score: score.targetToUserScore,
    };
  });
  return recommendations;
}
