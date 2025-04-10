import { NextResponse } from "next/server";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const result = await fetchActivityLogs({ limit, startAfter });

  return NextResponse.json(result);
}
