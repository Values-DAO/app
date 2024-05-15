import {openai} from "./openai";

export const generateValuesForUser = async (casts: string[]) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "Extract up to 7 single-worded first principles values from the following tweets and return them in a single string, separated by commas.",
      },
      {
        role: "user",
        content: casts.join("\n"),
      },
    ],
  });
  console.log(completion.choices[0].message.content);
  let values = completion.choices[0].message.content?.split(",");
  values = values?.map((value: string) => value.trim());
  return values;
};
