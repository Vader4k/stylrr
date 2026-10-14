import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// Called by the backend when product data changes (admin edits, stock changes
// after an order), so cached pages update immediately instead of waiting for
// the hourly fallback. Lives outside /api because /api/* is rewritten to the backend.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tags: unknown = body?.tags

  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")) {
    return NextResponse.json({ message: "Expected { tags: string[] }" }, { status: 400 })
  }

  for (const tag of tags) {
    // expire immediately so the next visitor sees fresh prices and stock
    revalidateTag(tag, { expire: 0 })
  }

  return NextResponse.json({ revalidated: tags })
}
