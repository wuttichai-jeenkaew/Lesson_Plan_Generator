// src/app/api/images/route.ts
import { NextResponse } from "next/server";
import { searchImages } from "@/lib/image-providers";

// ==== Simple in-memory LRU cache (dev/PoC) ====
type CacheEntry = { data: any; expiresAt: number };
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 นาที
const MAX_ITEMS = 200;
const globalAny: any = globalThis as any;
const cache: Map<string, CacheEntry> = globalAny.__imgCache || new Map();
if (!globalAny.__imgCache) globalAny.__imgCache = cache;

function getCache(key: string) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { cache.delete(key); return null; }
  // LRU touch
  cache.delete(key); cache.set(key, e);
  return e.data;
}
function setCache(key: string, data: any) {
  if (cache.size >= MAX_ITEMS) {
    // delete oldest
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ==== Very basic rate limit per IP (dev/PoC) ====
const RATE_WINDOW_MS = 60 * 1000; // 1 นาที
const RATE_MAX = 30; // 30 req/นาที/ไอพี
const rlStore: Map<string, number[]> = globalAny.__imgRate || new Map();
if (!globalAny.__imgRate) globalAny.__imgRate = rlStore;

function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  return (xf?.split(",")[0].trim()) || req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim();
  if (!query) return NextResponse.json({ images: [] });

  // rate limit
  const ip = getIP(req);
  const now = Date.now();
  const arr = rlStore.get(ip) || [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    return NextResponse.json({ images: [], error: "Too Many Requests" }, { status: 429 });
  }
  recent.push(now); rlStore.set(ip, recent);

  // cache
  const key = query.toLowerCase();
  const cached = getCache(key);
  if (cached) return NextResponse.json({ images: cached, cached: true });

  try {
    const images = await searchImages(query);
    setCache(key, images);
    return NextResponse.json({ images, cached: false });
  } catch (e) {
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}