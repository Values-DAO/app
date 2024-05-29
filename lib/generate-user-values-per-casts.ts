import {openai} from "./openai";

export const generateValuesForUser = async (casts: string[]) => {
  const content = casts.join("\n").slice(0, 30000); // assuming ~35k equates to 8k tokens
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Extract up to 7 single-worded first principles values from the following tweets and return them in a single string, separated by commas.",
      },
      {
        role: "user",
        content: content,
      },
    ],
  });

  let values = completion.choices[0].message.content?.split(",");
  values = values?.map((value: string) => value.trim());
  return values;
};
