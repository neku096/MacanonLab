import { NextResponse } from "next/server";
import {
  isAdminWriteEnabled,
  readAdminProductsPayload,
  writeAdminProductsPayload
} from "@/lib/adminProductsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin products API is local-only." }, { status: 403 });
  }

  return NextResponse.json(await readAdminProductsPayload());
}

export async function PUT(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin products API is local-only." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await writeAdminProductsPayload(payload);
  return NextResponse.json(result, { status: result.saved ? 200 : 400 });
}
