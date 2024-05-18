import {generateImage} from "@/lib/generate-image";
import axios from "axios";
import {NextResponse} from "next/server";

export async function POST(req: Request, res: Response) {
  const {value, valuePrompt} = await req.json();
  if (!value || !valuePrompt) {
    return NextResponse.json({
      status: 400,
      error: "Missing value or value prompt",
    });
  }

  const image = await generateImage(value, valuePrompt);

  const uploadImageToIPFS = await axios.post(
    "/api/pin",

    {
      imageUrl: image,
      name: value,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
      },
    }
  );
}
