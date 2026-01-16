import clientPromise from "@/lib/mongodb-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "down" }, { status: 500 });
  }
}
