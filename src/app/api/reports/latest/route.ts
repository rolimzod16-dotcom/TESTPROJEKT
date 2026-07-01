import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getHiveByUserId, getLastReport } from "@/lib/hives";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hive = await getHiveByUserId(session.id);
  if (!hive) {
    return NextResponse.json({ error: "Hive not found" }, { status: 404 });
  }

  const report = await getLastReport(hive.id);

  return NextResponse.json({
    ok: true,
    hiveId: hive.id,
    report,
  });
}