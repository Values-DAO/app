import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
export async function generateImage(
  value: string,
  prompt: string
): Promise<any> {
  try {
    if (!value || !prompt) return null;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: generate an image that represents ${value} in a colorful sketch using only yellow color in one human face that depicts the ${value}. ${value} here means ${prompt}. Use only Yellow Color.`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
