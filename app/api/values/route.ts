import connectToDatabase from "@/lib/connect-to-database";
import Values from "@/models/values";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid";
export async function POST(req: NextRequest) {
  const {name} = await req.json();

  if (!name) {
    return NextResponse.json({error: "Name is required"});
  }
  try {
    await connectToDatabase();
    const Value = await Values.create({name, valueId: `value_${uuidv4()}`});
    return NextResponse.json(Value);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({error: "Duplicate key error"});
    } else {
      console.error(error);
      return NextResponse.json(error);
    }
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const values = await Values.find(
      {},
      {name: 1, valueId: 1, _id: 0, minters: 1}
    );
    const updatedValues = values.map((value: any) => ({
      name: value.name,
      valueId: value.valueId,
      mintersCount: value.minters.length,
    }));

    return NextResponse.json(updatedValues);
  } catch (error) {
    return NextResponse.json(error);
  }
}
