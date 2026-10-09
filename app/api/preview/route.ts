import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

function isValidSecret(candidate: string | null, expected: string | undefined) {
  if (!candidate || !expected) return false;

  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return (
    candidateBytes.length === expectedBytes.length &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function isAllowedPreviewPath(path: string) {
  return (
    path === "/" ||
    path === "/products" ||
    /^\/(articles|teams|products)\/[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(path)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("slug");

  if (!isValidSecret(secret, process.env.HYGRAPH_PREVIEW_SECRET)) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  if (!path || !isAllowedPreviewPath(path)) {
    return new Response("Invalid preview path", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();
  return NextResponse.redirect(new URL(path, request.url));
}
