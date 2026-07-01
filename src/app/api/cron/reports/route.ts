import { NextRequest, NextResponse } from "next/server";
import { runSimulatorTick } from "@/lib/simulator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSimulatorTick();
    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[cron/reports]", error);
    return NextResponse.json(
      { error: "Simulator tick failed" },
      { status: 500 },
    );
  }
}