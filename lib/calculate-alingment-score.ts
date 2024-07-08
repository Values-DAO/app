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
  allUsers: IUser[],
  oneOnOne?: boolean
) {
  let alignmentScores = [];

  if (
    targetUser.generatedValues === undefined ||
    targetUser.generatedValues === null ||
    Object.keys(targetUser.generatedValues).length === 0
  ) {
    console.log("No generated values for target user");
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
      console.log("No generated values for user", user);
      continue;
    }
    const userValues = Object.keys(user.generatedValues).reduce(
      (acc: any, key) => {
        acc[key.toLowerCase()] = user.generatedValues[key as string];
        return acc;
      },
      {}
    );

    if (Object.keys(userValues).length === 0) {
      console.log("No generated values for user", user);
      continue;
    }
    let commonKeys = Object.keys(targetUserValues).filter(
      (key) => userValues && key in userValues
    );
    console.log("commonKeys", commonKeys);
    if (commonKeys.length === 0) {
      console.log("No common keys between target and user", user);
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
        console.log("No value for key", key);
        totalScore += 0;
      }
    });

    let targetScore = totalScore / Object.keys(targetUserValues).length;
    let userScore = totalScore / Object.keys(userValues).length;

    let alignmentScore: any = {
      targetToUserScore: Math.round(targetScore),
      userToTargetScore: Math.round(userScore),
    };
    if (!oneOnOne) {
      alignmentScore = {
        fid: user.fid,
        username: user.username,
        casts: user.casts,
        wallets: user.wallets,
        values: user.generatedValues,
        targetToUserScore: Math.round(targetScore),
        userToTargetScore: Math.round(userScore),
      };
    }

    alignmentScores.push(alignmentScore);
  }

  // Sort alignmentScores array in descending order based on score
  if (!oneOnOne) {
    alignmentScores.sort((a, b) => b.targetToUserScore - a.targetToUserScore);

    // Remove targetUser if it exists in alignmentScores array
    alignmentScores = alignmentScores.filter(
      (user) => user.fid !== targetUser.fid
    );
  }

  return alignmentScores.slice(0, 3);
}
