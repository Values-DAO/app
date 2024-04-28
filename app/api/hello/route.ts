import {generateInviteCodes} from "@/lib/generate-invite-code";
import {NextResponse} from "next/server";

export function GET() {
  const codes = generateInviteCodes(new Date());
  return NextResponse.json(codes);
}
