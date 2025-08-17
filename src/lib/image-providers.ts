import type { ImageItem } from "@/lib/schemas";
import axios from "axios";

export async function searchUnsplash(query: string, perPage = 6): Promise<ImageItem[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  try {
    const res = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      { headers: { Authorization: `Client-ID ${key}` }, params: {}, responseType: "json" }
    );
    const data = res.data;
    return (data.results ?? []).map((it: any) => ({
      url: it.urls?.regular,
      source: "unsplash",
      alt: it.alt_description || query,
      attribution: `${it.user?.name} on Unsplash`,
    }));
  } catch {
    return [];
  }
}

export async function searchPixabay(query: string, perPage = 6): Promise<ImageItem[]> {
  const key = process.env.PIXABAY_KEY;
  if (!key) return [];
  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${perPage}`;
  try {
    const res = await axios.get(url, { responseType: "json" });
    const data = res.data;
    return (data.hits ?? []).map((hit: any) => ({
      url: hit.webformatURL || hit.largeImageURL,
      source: "pixabay",
      alt: hit.tags || query,
      attribution: `Pixabay / ${hit.user || "unknown"}`,
    }));
  } catch {
    return [];
  }
}

export async function searchImages(query: string): Promise<ImageItem[]> {
  // ลอง Unsplash ก่อน หากว่างค่อยลอง Pixabay เป็น fallback
  const u = await searchUnsplash(query);
  if (u.length > 0) return u;
  const p = await searchPixabay(query);
  return p;
}