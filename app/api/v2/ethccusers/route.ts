import ETHCCFCAttendee from "@/models/ethccfarcaster";
import {NextResponse} from "next/server";

export async function POST(req: any) {
  const {users} = await req.json();

  try {
    const usersData = await ETHCCFCAttendee.insertMany(users);
    return NextResponse.json({
      status: 200,
      users: usersData,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}
