import { NextResponse } from "next/server";
import { isAdminWriteEnabled, validateAdminProductsPayload } from "@/lib/adminProductsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin products API is local-only." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = await validateAdminProductsPayload(payload);
  return NextResponse.json({ validation }, { status: validation.ok ? 200 : 400 });
}
