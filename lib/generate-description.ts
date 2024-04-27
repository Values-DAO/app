import {openai} from "./openai";

export async function generateDescription(value: string): Promise<any> {
  try {
    if (!value) return null;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `What does ${value} mean to you in one line. Be thoughtful. Answer should be in less than 10 words.`,
        },
        {
          role: "user",
          content: `${value}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating description:", error);
    return null;
  }
}
