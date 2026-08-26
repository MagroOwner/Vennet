import type { Listing } from "@/lib/types";

export type CollectionDefinition = {
  slug: string;
  name: string;
  description: string;
  accent: string;
  keywords: string[];
};

export const COLLECTIONS: CollectionDefinition[] = [
  { slug: "design", name: "Design", description: "Brand kits, graphics, UI assets, and presentation-ready tools.", accent: "from-fuchsia-500 to-violet-500", keywords: ["design", "graphic", "brand", "ui", "template"] },
  { slug: "templates", name: "Templates", description: "Polished starting points for work that should not start from zero.", accent: "from-sky-500 to-cyan-400", keywords: ["template", "notion", "canva", "document", "planner"] },
  { slug: "music-audio", name: "Music & Audio", description: "Sound packs, production resources, and creator-ready audio.", accent: "from-amber-400 to-orange-500", keywords: ["music", "audio", "sound", "beat", "sample"] },
  { slug: "code", name: "Code", description: "Starter kits, components, automations, and tools for builders.", accent: "from-emerald-400 to-teal-500", keywords: ["code", "developer", "app", "plugin", "automation"] },
  { slug: "ai-tools", name: "AI Tools", description: "Prompts, workflows, and practical systems for faster creative work.", accent: "from-lime-400 to-emerald-500", keywords: ["ai", "prompt", "automation", "workflow"] },
  { slug: "education", name: "Education", description: "Guides, courses, and resources that help people do better work.", accent: "from-rose-400 to-pink-500", keywords: ["education", "course", "guide", "learn"] },
  { slug: "productivity", name: "Productivity", description: "Systems, dashboards, and digital tools for clearer days.", accent: "from-indigo-400 to-blue-500", keywords: ["productivity", "system", "dashboard", "planner"] },
  { slug: "creator-services", name: "Creator Services", description: "Specialist help delivered online by trusted creators.", accent: "from-cyan-400 to-emerald-400", keywords: ["service", "consulting", "editing", "design"] },
];

export function getCollection(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function collectionMatchesListing(collection: CollectionDefinition, listing: Listing) {
  const details = listing as Listing & { collection?: string | null; tags?: string[] | null };
  const searchable = [listing.title, listing.description, details.collection ?? "", ...(details.tags ?? [])].join(" ").toLowerCase();
  return details.collection?.toLowerCase() === collection.slug || collection.keywords.some((keyword) => searchable.includes(keyword));
}
