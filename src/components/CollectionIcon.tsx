import type { CollectionDefinition } from "@/lib/collections";

export function CollectionIcon({ collection, className = "h-5 w-5" }: { collection: Pick<CollectionDefinition, "slug">; className?: string }) {
  const common = { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.9, "aria-hidden": true as const };
  switch (collection.slug) {
    case "design": return <svg {...common}><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>;
    case "templates": return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case "music-audio": return <svg {...common}><path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm10-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" /></svg>;
    case "code": return <svg {...common}><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></svg>;
    case "bots-automations": return <svg {...common}><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" /></svg>;
    case "ai-tools": return <svg {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" /></svg>;
    case "education": return <svg {...common}><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M7 13v4c3 2 7 2 10 0v-4" /></svg>;
    case "productivity": return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12h8M12 8v8" /></svg>;
    default: return <svg {...common}><path d="M12 3a6 6 0 0 0-6 6c0 6 6 12 6 12s6-6 6-12a6 6 0 0 0-6-6Z" /><circle cx="12" cy="9" r="2" /></svg>;
  }
}
