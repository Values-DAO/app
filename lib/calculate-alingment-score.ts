interface IUser {
  fid: string;
  generatedValues: {
    [key: string]: any;
  };
  username?: string;
  wallets?: string[];
  casts?: string;
}

export default function calculateAlignmentScore(
  targetUser: IUser,
  allUsers: IUser[]
) {
  let alignmentScores = [];
  if (
    targetUser.generatedValues === undefined ||
    targetUser.generatedValues === null ||
    Object.keys(targetUser.generatedValues).length === 0
  ) {
    return [];
  }
  const targetUserValues = Object.keys(targetUser.generatedValues).reduce(
    (acc: any, key: any) => {
      acc[key.toLowerCase()] = targetUser.generatedValues[key as string];
      return acc;
    },
    {}
  );
  for (const user of allUsers) {
    if (user.casts && user?.casts?.length < 10000) {
      console.log("skiiping this user", user);
      continue;
    }
    if (
      user.generatedValues === undefined ||
      user.generatedValues === null ||
      Object.keys(user.generatedValues).length === 0
    ) {
      continue;
    }
    const userValues = Object.keys(user.generatedValues).reduce(
      (acc: any, key) => {
        acc[key.toLowerCase()] = user.generatedValues[key as string];
        return acc;
      },
      {}
    );
    console.log("User", userValues);
    console.log("Target user", targetUserValues);
    if (Object.keys(userValues).length === 0) {
      continue;
    }
    let commonKeys = Object.keys(targetUserValues).filter(
      (key) => userValues && key in userValues
    );
    if (commonKeys.length === 0) {
      continue;
    }
    let totalScore = 0;
    let maxScore = 100; // Maximum similarity score per trait
    commonKeys.forEach((key) => {
      if (targetUserValues && userValues && key in userValues) {
        let value1 = targetUserValues[key];
        let value2 = userValues[key];
        let difference = Math.abs(value1 - value2);
        let similarity = maxScore - difference; // Higher similarity for lower differences
        totalScore += similarity;
      } else {
        totalScore += 0;
      }
    });
    // Calculate the average similarity score

    let targetScore = totalScore / Object.keys(targetUserValues).length;
    let userScore = totalScore / Object.keys(userValues).length;
    // Normalize the average similarity to be between 1 and 100
    const alignmentScore = {
      fid: user.fid,
      username: user.username,
      casts: user.casts,
      wallets: user.wallets,
      values: user.generatedValues,
      targetToUserScore: Math.round(targetScore),
      userToTargetScore: Math.round(userScore),
    };
    alignmentScores.push(alignmentScore);
  }

  // Sort alignmentScores array in descending order based on score
  alignmentScores.sort((a, b) => b.targetToUserScore - a.targetToUserScore);

  // Remove targetUser if it exists in alignmentScores array
  alignmentScores = alignmentScores.filter(
    (user) => user.fid !== targetUser.fid
  );
  return alignmentScores.slice(0, 3);
}
