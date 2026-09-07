import type { Listing } from "@/lib/types";

export type CollectionDefinition = { slug: string; name: string; description: string; accent: string; keywords: string[]; };

export const COLLECTIONS: CollectionDefinition[] = [
  { slug: "design", name: "Design", description: "Brand kits, graphics, UI assets, and presentation-ready tools.", accent: "from-rose-400 to-orange-300", keywords: ["design", "graphic", "brand", "ui", "template"] },
  { slug: "templates", name: "Templates", description: "Polished starting points for work that should not start from zero.", accent: "from-amber-300 to-yellow-200", keywords: ["template", "notion", "canva", "document", "planner"] },
  { slug: "music-audio", name: "Music & Audio", description: "Sound packs, production resources, and creator-ready audio.", accent: "from-orange-300 to-rose-300", keywords: ["music", "audio", "sound", "beat", "sample"] },
  { slug: "code", name: "Code", description: "Starter kits, components, automations, and tools for builders.", accent: "from-emerald-300 to-lime-300", keywords: ["code", "developer", "app", "plugin", "automation"] },
  { slug: "bots-automations", name: "Bots & Automations", description: "Discord bots, workflow automations, integrations, and systems that keep work moving.", accent: "from-teal-300 to-emerald-200", keywords: ["discord", "bot", "automation", "workflow", "integration", "zapier", "make", "n8n", "slack"] },
  { slug: "ai-tools", name: "AI Tools", description: "Prompts, workflows, and practical systems for faster creative work.", accent: "from-lime-300 to-emerald-300", keywords: ["ai", "prompt", "automation", "workflow"] },
  { slug: "education", name: "Education", description: "Guides, courses, and resources that help people do better work.", accent: "from-stone-300 to-amber-200", keywords: ["education", "course", "guide", "learn"] },
  { slug: "productivity", name: "Productivity", description: "Systems, dashboards, and digital tools for clearer days.", accent: "from-yellow-200 to-lime-200", keywords: ["productivity", "system", "dashboard", "planner"] },
  { slug: "creator-services", name: "Creator Services", description: "Specialist help delivered online by trusted creators.", accent: "from-emerald-200 to-stone-200", keywords: ["service", "consulting", "editing", "design"] },
];

export function getCollection(slug: string) { return COLLECTIONS.find((collection) => collection.slug === slug); }

export function collectionMatchesListing(collection: CollectionDefinition, listing: Listing) {
  const details = listing as Listing & { collection?: string | null; tags?: string[] | null };
  const searchable = [listing.title, listing.description, details.collection ?? "", ...(details.tags ?? [])].join(" ").toLowerCase();
  return details.collection?.toLowerCase() === collection.slug || collection.keywords.some((keyword) => searchable.includes(keyword));
}
