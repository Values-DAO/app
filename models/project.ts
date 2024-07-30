import {model, models, Schema} from "mongoose";

export interface IProject {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  twitter?: string;
  website?: string;
  chainId: string;
  contractAddress: string;
  verified: boolean;
  values: string[];
  totalsMinters: number;
  category: "NFT" | "ERC20";
  valuesSource?: string;
}

const projectSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  twitter: {
    type: String,
  },
  website: {
    type: String,
  },
  chainId: {
    type: String,
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  values: {
    type: [String],
    default: [],
  },
  totalsMinters: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  valuesSource: {
    type: String,
  },
});

const Project = models.Project || model<IProject>("Project", projectSchema);
export default Project;
