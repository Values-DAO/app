import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {openai} from "@/lib/openai";
import {useParams} from "next/navigation";
import {NextResponse} from "next/server";

export async function GET(
  req: any,
  params: {
    params: {
      fid: string;
    };
  }
) {
  const {fid} = params.params;

  const casts = await fetchCastsForUser(fid, 100);
  if (casts.length < 100) {
    return NextResponse.json({
      fid,
      casts,
      error: "User has less than 100 casts",
    });
  }

  const generateValuesForUser = async (
    casts: string[],
    includeWeights?: Boolean
  ) => {
    const content = casts.join("\n").slice(0, 30000); // assuming ~35k equates to 8k tokens
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: ` You are a value analyst tasked with predicting a person's values based on their tweets. You will be given a list of tweets from a specific user and a fixed set of human values. Your job is to analyze each tweet thoroughly and predict which values from the given list are associated with this person.

First, here is the fixed set of human values you should consider:

<values>
[
    "Acceptance", "Accomplishment", "Accountability", "Accuracy", "Achievement",
    "Adaptability", "Alertness", "Altruism", "Ambition", "Amusement", "Assertiveness",
    "Attentive", "Authenticity", "Awareness", "Balance", "Beauty", "Benevolence",
    "Boldness", "Bravery", "Brilliance", "Calm", "Candor", "Capable", "Careful",
    "Certainty", "Challenge", "Charity", "Cleanliness", "Clear", "Clever", "Comfort",
    "Commitment", "Common sense", "Communication", "Community", "Compassion",
    "Competence", "Concentration", "Confidence", "Connection", "Consciousness",
    "Consistency", "Contentment", "Contribution", "Control", "Conviction", "Cooperation",
    "Courage", "Courtesy", "Creation", "Creativity", "Credibility", "Curiosity", "Decisive",
    "Decisiveness", "Dedication", "Dependability", "Determination", "Development",
    "Devotion", "Dignity", "Diligence", "Discipline", "Discovery", "Diversity", "Drive",
    "Effectiveness", "Efficiency", "Empathy", "Empower", "Endurance", "Energy",
    "Enjoyment", "Enthusiasm", "Equality", "Ethical", "Excellence", "Experience",
    "Exploration", "Expressive", "Fairness", "Family", "Famous", "Fearless", "Feelings",
    "Ferocious", "Fidelity", "Flexibility", "Focus", "Foresight", "Fortitude", "Freedom",
    "Friendliness", "Friendship", "Fun", "Generosity", "Genius", "Giving", "Goodness",
    "Grace", "Gratitude", "Greatness", "Growth", "Happiness", "Hard work", "Harmony",
    "Health", "Honesty", "Honor", "Hope", "Humility", "Imagination", "Improvement",
    "Independence", "Individuality", "Influence", "Inclusivity", "Innovation", "Inquisitive",
    "Insightful", "Inspiration", "Integrity", "Intelligence", "Intensity", "Intuitive",
    "Irreverent", "Joy", "Joyfulness", "Justice", "Kindness", "Knowledge", "Lawful",
    "Leadership", "Learning", "Liberty", "Logic", "Love", "Loyalty", "Magnanimity",
    "Mastery", "Maturity", "Meaning", "Mindfulness", "Moderation", "Modesty",
    "Motivation", "Open-mindedness", "Openness", "Optimism", "Order", "Organization",
    "Originality", "Passion", "Patience", "Peace", "Perseverance", "Performance",
    "Persistence", "Playfulness", "Poise", "Politeness", "Potential", "Power", "Pragmatism",
    "Precision", "Present", "Proactivity", "Productivity", "Professionalism", "Prosperity",
    "Prudence", "Punctuality", "Purpose", "Purity", "Quality", "Quietness", "Realism",
    "Reason", "Recognition", "Recreation", "Reflection", "Reflective", "Reliability",
    "Resilience", "Resourcefulness", "Respect", "Respectfulness", "Responsibility",
    "Restraint", "Results-oriented", "Reverence", "Righteousness", "Rigor", "Risk",
    "Satisfaction", "Security", "Self-control", "Self-improvement", "Self-reliance",
    "Selfless", "Sensitivity", "Serenity", "Service", "Sharing", "Significance", "Silence",
    "Simplicity", "Sincerity", "Skill", "Skillfulness", "Smart", "Solitude", "Solidarity",
    "Spirit", "Spirituality", "Spontaneity", "Spontaneous", "Stability", "Status",
    "Stewardship", "Strength", "Structure", "Success", "Support", "Supportiveness",
    "Surprise", "Sustainability", "Sympathy", "Talent", "Teamwork", "Temperance",
    "Thankful", "Thorough", "Thoughtful", "Thoughtfulness", "Thrift", "Timeliness",
    "Tolerance", "Toughness", "Traditional", "Tranquility", "Transparency", "Trust",
    "Trustworthy", "Truth", "Understanding", "Uniqueness", "Unity", "Valor", "Victory",
    "Vigor", "Vision", "Vitality", "Volunteering", "Warmth", "Watchfulness", "Wealth",
    "Welcoming", "Willpower", "Winning", "Wisdom", "Wonder", "Zeal", "Zest"
]
</values>

Now, here are the tweets from the user you need to analyze:

<tweets>
${content}
</tweets>

Please follow these steps:

1. Carefully read through each tweet, considering the content, tone, and implications.

2. For each tweet, think about what it might reveal about the person's values, beliefs, and priorities. Consider both explicit statements and implicit meanings.

3. As you analyze the tweets, keep the list of human values in mind. Look for connections between the content of the tweets and these values.
4. After analyzing all tweets, determine which of the given values are most strongly held by this person based on the evidence in their tweets.

5. Assign weightage from 1 to 100 based on how important each value. This is based on tweet content as well.

6. Do not include explanations or justifications in your final output.

7. Give me a list of their values in descending order of weightage

8. Now Imagine a spectrum of 1 to 100 stands for most individualistic thinking and hundred for most collectivist thinking where would you rate the person based on their casts given above, rate them. Here Individualist vs Collective is the spectrum, now also do all the spectrum listed in  this list [capitalism vs communism , holistic vs reductive, Individualist vs collective]
Your final output should be always an JSON and has to follow the format below: 
interface UserValues {
    [key: string]: number;
}
interface UserSpectrum: {spectrum:string;score:Number; description:string}[]

interface finalResponse{
    UserValues:UserValues;
    UserSpectrum:UserSpectrum;
}

`,
        },
      ],
    });

    let values: any = completion.choices[0].message.content
      ?.replace("```json", "")
      .replace("```", "");
    values = JSON.parse(values!);

    if (includeWeights) {
      return values;
    }
    const topValues = Object.keys(values).slice(0, 7);
    return values;
  };
  const data = await generateValuesForUser(casts);

  return NextResponse.json({fid, data});
}
