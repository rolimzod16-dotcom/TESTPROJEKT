import { NextResponse } from "next/server";
import { APK_DOWNLOAD_PATH } from "@/lib/apk-download";

export async function GET(request: Request) {
  const url = new URL(APK_DOWNLOAD_PATH, request.url);
  return NextResponse.redirect(url, 308);
}