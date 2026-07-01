import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, Search } from "lucide-react";

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
}

export const ImageLibraryPicker = ({ open, onOpenChange, onSelect, currentUrl }: Props) => {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(FOLDER, { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        toast.error("Could not load image library");
      } else {
        setItems(
          (data || [])
            .filter((f) => f.name && !f.name.endsWith("/"))
            .map((f) => ({
              name: f.name,
              created_at: f.created_at,
              url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}/${f.name}`,
            })),
        );
      }
      setLoading(false);
    })();
  }, [open]);

  const filtered = q
    ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose from image library</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading images...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No images uploaded yet. Upload one from the product editor first.
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
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-28 object-cover"
                    />
                    {selected && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.name}
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
