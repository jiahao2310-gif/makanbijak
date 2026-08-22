import Fuse from "fuse.js";
import myFcdData from "./myfcd-data.json";
import { FoodItem } from "./types";

const fuse = new Fuse(myFcdData, {
  keys: ["name_en", "name_ms"],
  threshold: 0.45,
  includeScore: true,
});

export const myFcdFoods: FoodItem[] = myFcdData;

export function searchMyFcd(query: string, threshold = 0.6): FoodItem | null {
  if (!query) return null;

  const q = query.toLowerCase().trim();

  const exact = myFcdData.find(
    (f) =>
      f.name_en.toLowerCase() === q ||
      f.name_ms.toLowerCase() === q ||
      q.includes(f.name_en.toLowerCase()) ||
      q.includes(f.name_ms.toLowerCase())
  );

  if (exact) return exact as FoodItem;

  const results = fuse.search(query);
  if (results.length === 0) return null;
  const best = results[0];
  if (best.score === undefined) return best.item as FoodItem;
  const similarity = 1 - best.score;
  if (similarity < threshold) return null;
  return best.item as FoodItem;
}
