import { NextResponse } from "next/server";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";
import {
  readAdminSlideLinksPayload,
  validateAdminSlideLinksPayload,
  writeAdminSlideLinksPayload
} from "@/lib/adminSlideLinksStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin slide links API is local-only." }, { status: 403 });
  }

  return NextResponse.json(await readAdminSlideLinksPayload());
}

export async function POST(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin slide links API is local-only." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = await validateAdminSlideLinksPayload(payload);
  return NextResponse.json({ validation }, { status: validation.ok ? 200 : 400 });
}

export async function PUT(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin slide links API is local-only." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await writeAdminSlideLinksPayload(payload);
  return NextResponse.json(result, { status: result.saved ? 200 : 400 });
}
