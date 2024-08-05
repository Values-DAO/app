import mongoose, {Schema, models} from "mongoose";

interface IWildcard {
  fid: number;
  suggestions: {
    fid: number;
    score: number;
    recentCasts: any[];
  };
}
const wildcardSchema = new Schema(
  {
    fid: {
      type: Number,
      unique: true,
    },
    suggestions: {
      fid: {
        type: Number,
      },
      score: {
        type: Number,
      },
      recentCasts: {
        type: Array,
      },
    },
  },
  {timestamps: true}
);

wildcardSchema.pre("save", function (next) {
  if (this.isNew) {
    return next();
  }

  Wildcard.findOne({fid: this.fid}, (err: any, wildcard: any) => {
    if (err) {
      return next(err);
    }

    if (wildcard) {
      wildcard.suggestions = this.suggestions;
      return wildcard.save(next);
    }

    return next();
  });
});

const Wildcard =
  models.Wildcard ||
  mongoose.models.Wildcard ||
  mongoose.model("Wildcard", wildcardSchema);
export default Wildcard;
