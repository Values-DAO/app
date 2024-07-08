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
  for (const user of allUsers) {
    let commonKeys = Object.keys(targetUser.generatedValues).filter(
      (key) => user.generatedValues && key in user.generatedValues
    );
    let totalScore = 0;
    let maxScore = 100; // Maximum similarity score per trait

    commonKeys.forEach((key) => {
      let value1 = targetUser.generatedValues[key];
      let value2 = user.generatedValues[key];
      let difference = Math.abs(value1 - value2);
      let similarity = maxScore - difference; // Higher similarity for lower differences
      totalScore += similarity;
    });

    // Calculate the average similarity score
    let averageSimilarity = totalScore / commonKeys.length;

    // Normalize the average similarity to be between 1 and 100
    let normalizedScore = (averageSimilarity / maxScore) * 100;
    const alignmentScore = {
      fid: user.fid,
      username: user.username,
      casts: user.casts,
      wallets: user.wallets,
      values: user.generatedValues,
      score: Math.round(normalizedScore),
    };
    alignmentScores.push(alignmentScore);
  }
  // Sort alignmentScores array in descending order based on score
  alignmentScores.sort((a, b) => b.score - a.score);

  // Remove targetUser if it exists in alignmentScores array
  alignmentScores = alignmentScores.filter(
    (user) => user.fid !== targetUser.fid
  );
  return alignmentScores.slice(0, 3);
}
