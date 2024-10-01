import {Schema} from "mongoose";

export interface IUser {
  userId: string;
  email?: string;
  fid?: number;
  twitterUsername?: string;
  twitterId?: string;
  wallets: string[];
  profileMinted: boolean;
  profileNft?: number;
  generatedValues: {
    twitter: string[];
    warpcast: string[];
  };
  generatedValuesWithWeights: {
    twitter: {
      [key: string]: number;
    };
    warpcast: {
      [key: string]: number;
    };
  };
  spectrum: {
    warpcast: {
      name: string;
      description: string;
      score: number;
    }[];
    twitter: {
      name: string;
      description: string;
      score: number;
    }[];
  };
  userContentRemarks: {
    warpcast?: string;
    twitter?: string;
  };
  mintedValues: {
    value: Schema.Types.ObjectId;
    weightage: number;
  }[];
  balance: number;
  userTxHashes: {
    txHash: string;
    createdAt: Date;
  }[];
  communitiesMinted: Schema.Types.ObjectId[];
  attestations: string[];
  referrer?: string;
  socialValuesMinted: string[];
}

export type FarcasterSearchUserType = {
  Socials: {
    Social: {
      fid: string;
      username: string;
    }[];
  };
};
