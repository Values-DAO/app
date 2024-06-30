import {openai} from "./openai";

export const generateValuesForUser = async (casts: string[]) => {
  const content = casts.join("\n"); // assuming ~35k equates to 8k tokens
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a value analyst tasked with predicting a person's values based on their tweets. You will be given a list of tweets from a specific user and a fixed set of human values. Your job is to analyze each tweet thoroughly and predict which values from the given list are associated with this person.

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

4. After analyzing all tweets, determine which of the given values are most strongly associated with this person based on the evidence in their tweets.

5. Only select values from the provided list. Do not introduce new values that are not in the list.

6. Provide your response as a single string with each identified value separated by a comma. Do not include explanations or justifications in your final output.

Your final output should be consist only of the comma-separated list of values.`,
      },
    ],
  });
  console.log(completion.choices[0].message.content);
  let values = completion.choices[0].message.content?.slice(1, -1).split(",");
  values = values?.map((value: string) => value.trim());
  return values;
};
