import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getHiveByUserId } from "@/lib/hives";
import { createReportForHive } from "@/lib/simulator";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hive = await getHiveByUserId(session.id);
  if (!hive) {
    return NextResponse.json({ error: "Hive not found" }, { status: 404 });
  }

  const report = await createReportForHive(hive.id, session.id);

  return NextResponse.json({
    ok: true,
    report,
  });
}