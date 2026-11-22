import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CommunityEvent } from "@/data/communities";

const EVENTS_STORE_PATH = path.join(process.cwd(), ".custom-events.json");

async function readStoredEvents(): Promise<Record<string, CommunityEvent>> {
  try {
    const raw = await fs.readFile(EVENTS_STORE_PATH, "utf8");
    return JSON.parse(raw) as Record<string, CommunityEvent>;
  } catch {
    return {};
  }
}

async function writeStoredEvents(store: Record<string, CommunityEvent>): Promise<void> {
  try {
    await fs.writeFile(EVENTS_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore write failure in read-only env
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const store = await readStoredEvents();

  if (slug) {
    const event = store[slug] ?? null;
    return NextResponse.json({ event });
  }

  return NextResponse.json({ events: Object.values(store) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { event?: CommunityEvent };
    if (!body.event || !body.event.slug) {
      return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
    }
    const store = await readStoredEvents();
    store[body.event.slug] = body.event;
    await writeStoredEvents(store);
    return NextResponse.json({ ok: true, event: body.event });
  } catch {
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }
}
