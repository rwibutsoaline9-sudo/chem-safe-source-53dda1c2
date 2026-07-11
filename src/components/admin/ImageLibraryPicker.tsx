import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, Search, X } from "lucide-react";

const SUPABASE_URL = "https://lriwodanoclewwjrsimi.supabase.co";
const BUCKET = "product-images";
const FOLDER = "products";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentUrl?: string | null;
}

interface StorageItem {
  name: string;
  url: string;
  created_at?: string;
  productName?: string;
  category?: string;
  tags: string[];
  unused: boolean;
}

// Derive short tags from a product name so admins can filter by chemistry group.
function deriveTags(name: string, category: string): string[] {
  const value = `${name} ${category}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/acid/, "acid"],
    [/hydroxide|caustic|alkali/, "alkali"],
    [/sulfate|sulphate|chloride|nitrate|bromide|iodide|acetate|carbonate|bicarbonate/, "salt"],
    [/oxide|dioxide/, "oxide"],
    [/cyanide|dichromate|fluoride|toxic/, "toxic"],
    [/peroxide|permanganate/, "oxidizer"],
    [/gas|oxygen|nitrogen|argon|helium|hydrogen|chlorine|ammonia/, "gas"],
    [/solvent|acetone|methanol|ethanol|toluene|xylene|dmf|dmso|ipa|isopropyl|butanol/, "solvent"],
    [/polymer|resin|epoxy|pvc|polyethylene|polypropylene|granule|pellet/, "polymer"],
    [/surfactant|sulfonate|ethoxylate|detergent|soap/, "surfactant"],
    [/fertilizer|urea/, "fertilizer"],
    [/copper|nickel|zinc|iron|ferric|aluminum|manganese/, "metal"],
    [/glycol|glycerin|glycerol/, "glycol"],
    [/boric|borax|borate/, "boron"],
  ];
  const tags = new Set<string>();
  for (const [pattern, tag] of rules) if (pattern.test(value)) tags.add(tag);
  if (category) tags.add(category.toLowerCase());
  return Array.from(tags);
}

export const ImageLibraryPicker = ({ open, onOpenChange, onSelect, currentUrl }: Props) => {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const [{ data: files, error }, { data: products }] = await Promise.all([
        supabase.storage
          .from(BUCKET)
          .list(FOLDER, { limit: 500, sortBy: { column: "created_at", order: "desc" } }),
        supabase.from("products").select("name, category, image_url"),
      ]);

      if (error) {
        toast.error("Could not load image library");
        setLoading(false);
        return;
      }

      const byUrl = new Map<string, { name: string; category: string }>();
      (products || []).forEach((p) => {
        if (p.image_url) byUrl.set(p.image_url, { name: p.name, category: p.category });
      });

      setItems(
        (files || [])
          .filter((f) => f.name && !f.name.endsWith("/"))
          .map((f) => {
            const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${f.name}`;
            const meta = byUrl.get(url);
            const tags = meta ? deriveTags(meta.name, meta.category) : [];
            return {
              name: f.name,
              created_at: f.created_at,
              url,
              productName: meta?.name,
              category: meta?.category,
              tags,
              unused: !meta,
            };
          }),
      );
      setLoading(false);
    })();
  }, [open]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (showUnusedOnly && !i.unused) return false;
      if (activeTags.size > 0 && !Array.from(activeTags).every((t) => i.tags.includes(t)))
        return false;
      if (!needle) return true;
      return (
        i.name.toLowerCase().includes(needle) ||
        i.productName?.toLowerCase().includes(needle) ||
        i.category?.toLowerCase().includes(needle) ||
        i.tags.some((t) => t.includes(needle))
      );
    });
  }, [items, q, activeTags, showUnusedOnly]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearFilters = () => {
    setQ("");
    setActiveTags(new Set());
    setShowUnusedOnly(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose from image library</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, category, filename or tag..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                type="button"
                onClick={() => setShowUnusedOnly((v) => !v)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  showUnusedOnly
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                Unused only
              </button>
              {allTags.map((tag) => {
                const active = activeTags.has(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {(activeTags.size > 0 || showUnusedOnly || q) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs px-2 py-1 rounded-full text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {loading ? "Loading..." : `${filtered.length} of ${items.length} image${items.length === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading images...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {items.length === 0
                ? "No images uploaded yet. Upload one from the product editor first."
                : "No images match your filters."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const selected = currentUrl === item.url;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onOpenChange(false);
                    }}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all text-left ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.productName || item.name}
                      loading="lazy"
                      className="w-full h-28 object-cover"
                    />
                    {selected && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {item.unused && (
                      <Badge
                        variant="secondary"
                        className="absolute top-1 left-1 text-[9px] px-1.5 py-0"
                      >
                        Unused
                      </Badge>
                    )}
                    <div className="px-1.5 py-1 bg-background/95">
                      <div className="text-[11px] font-medium truncate">
                        {item.productName || item.name}
                      </div>
                      {item.category && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.category}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
