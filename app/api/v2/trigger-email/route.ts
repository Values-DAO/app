import {sendMail} from "@/app/service/email";
import {NextResponse} from "next/server";

export async function POST(req: any) {
  const {body, subject} = await req.json();
  try {
    await sendMail(subject, body);
    return NextResponse.json({message: "Email Sent"});
  } catch (error) {
    return NextResponse.json({error: error}, {status: 500});
  }
}
