import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, FolderOpen, Trash2, Maximize2, SplitSquareHorizontal } from "lucide-react";
import { ImageLibraryPicker } from "./ImageLibraryPicker";
import { getProductImage } from "@/lib/productImages";

const SUPABASE_URL = "https://lriwodanoclewwjrsimi.supabase.co";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    category: string;
    image_url: string | null;
  } | null;
  onSaved: () => void;
}

export const QuickImageEditor = ({ open, onOpenChange, product, onSaved }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [slider, setSlider] = useState(50);

  if (!product) return null;

  const resolveSrc = (url: string | null | undefined) =>
    url
      ? url.startsWith("http")
        ? url
        : getProductImage(url, product.category, product.name)
      : getProductImage(null, product.category, product.name);

  const originalUrl = product.image_url;
  const originalSrc = resolveSrc(originalUrl);
  const currentUrl = pendingUrl !== undefined ? pendingUrl : originalUrl;
  const previewSrc = resolveSrc(currentUrl);
  const hasChange = pendingUrl !== undefined && pendingUrl !== originalUrl;

  const confirmDiscard = (message = "You have an unsaved image change. Discard it?") =>
    !hasChange || window.confirm(message);

  const requestClose = () => {
    if (confirmDiscard("Close without saving your image change?")) {
      setPendingUrl(undefined);
      onOpenChange(false);
    }
  };

  const requestSetPending = (url: string | null) => {
    if (hasChange && pendingUrl !== url) {
      if (!window.confirm("Replace your current pending image change with this one?")) return;
    }
    setPendingUrl(url);
  };

  // Reset load state when the source changes.
  useEffect(() => {
    setPreviewLoading(true);
    setPreviewError(false);
  }, [previewSrc]);

  const handleUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (hasChange && !window.confirm("Replace your current pending image change with this upload?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error("Upload failed");
    } else {
      setPendingUrl(`${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`);
      toast.success("Image uploaded — click Save to apply");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (pendingUrl === undefined) {
      onOpenChange(false);
      return;
    }

    if (pendingUrl && pendingUrl.includes("/storage/v1/object/public/product-images/")) {
      const { data: dupes } = await supabase
        .from("products")
        .select("id, name")
        .eq("image_url", pendingUrl);
      const conflicts = (dupes || []).filter((p) => p.id !== product.id);
      if (conflicts.length > 0) {
        const names = conflicts.map((c) => `"${c.name}"`).join(", ");
        const ok = window.confirm(
          `This image is already used by: ${names}.\n\nClick OK to reuse it for "${product.name}" anyway.`,
        );
        if (!ok) return;
      }
    }

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({ image_url: pendingUrl })
      .eq("id", product.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save image");
    } else {
      toast.success("Image updated");
      onSaved();
      setPendingUrl(undefined);
      onOpenChange(false);
    }
  };

  const sourceLabel = !currentUrl
    ? "Auto-generated"
    : currentUrl.includes("/storage/v1/object/public/product-images/")
      ? "Uploaded (Supabase)"
      : currentUrl.startsWith("http")
        ? "External URL"
        : "Bundled asset";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set image — {product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative w-full rounded-lg overflow-hidden bg-muted border" style={{ aspectRatio: "4 / 3" }}>
              {previewLoading && !previewError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/70 backdrop-blur-sm z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loading full-size preview...</span>
                </div>
              )}
              {previewError && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-destructive p-4 text-center">
                  Image failed to load. Try a different source.
                </div>
              )}
              <img
                key={previewSrc}
                src={previewSrc}
                alt={product.name}
                className="w-full h-full object-contain bg-background"
                onLoad={() => setPreviewLoading(false)}
                onError={() => {
                  setPreviewLoading(false);
                  setPreviewError(true);
                }}
              />
              {!previewLoading && !previewError && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {hasChange && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlider(50);
                        setCompareOpen(true);
                      }}
                      className="bg-background/90 border rounded-md p-1.5 hover:bg-background shadow-sm"
                      aria-label="Compare before / after"
                      title="Compare before / after"
                    >
                      <SplitSquareHorizontal className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="bg-background/90 border rounded-md p-1.5 hover:bg-background shadow-sm"
                    aria-label="View fullscreen"
                    title="View fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Source: <span className="font-medium text-foreground">{sourceLabel}</span>
              </span>
              {currentUrl && currentUrl.startsWith("http") && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground truncate max-w-[60%]"
                  title={currentUrl}
                >
                  Open original
                </a>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload new
              </Button>
              <Button type="button" variant="outline" onClick={() => setLibraryOpen(true)}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Choose from library
              </Button>
            </div>

            {currentUrl && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setPendingUrl(null)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear image (use auto-generated)
              </Button>
            )}

            {hasChange && (
              <div className="rounded-md border bg-muted/40 p-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Pending change — review before saving.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSlider(50);
                    setCompareOpen(true);
                  }}
                >
                  <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1.5" />
                  Compare before / after
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setPendingUrl(undefined);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || pendingUrl === undefined || previewLoading}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageLibraryPicker
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        currentUrl={currentUrl}
        onSelect={(url) => setPendingUrl(url)}
      />

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Fullscreen preview — {product.name}</DialogTitle>
          </DialogHeader>
          <img
            src={previewSrc}
            alt={product.name}
            className="w-full h-full max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare — {product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Side-by-side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Before</span>
                  <span className="text-muted-foreground">
                    {originalUrl ? "Current saved" : "Auto-generated"}
                  </span>
                </div>
                <div
                  className="relative w-full rounded-md overflow-hidden bg-muted border"
                  style={{ aspectRatio: "4 / 3" }}
                >
                  <img
                    src={originalSrc}
                    alt="Before"
                    className="w-full h-full object-contain bg-background"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">After</span>
                  <span className="text-muted-foreground">{sourceLabel}</span>
                </div>
                <div
                  className="relative w-full rounded-md overflow-hidden bg-muted border ring-2 ring-primary/40"
                  style={{ aspectRatio: "4 / 3" }}
                >
                  <img
                    src={previewSrc}
                    alt="After"
                    className="w-full h-full object-contain bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Slider overlay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Slider overlay</span>
                <span className="text-muted-foreground">Drag to reveal after</span>
              </div>
              <div
                className="relative w-full rounded-md overflow-hidden bg-muted border select-none"
                style={{ aspectRatio: "16 / 9" }}
              >
                <img
                  src={originalSrc}
                  alt="Before overlay"
                  className="absolute inset-0 w-full h-full object-contain bg-background"
                  draggable={false}
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${slider}%)` }}
                >
                  <img
                    src={previewSrc}
                    alt="After overlay"
                    className="absolute inset-0 w-full h-full object-contain bg-background"
                    draggable={false}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none"
                  style={{ left: `${slider}%` }}
                />
                <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-background/90 border">
                  Before
                </span>
                <span className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-background/90 border">
                  After
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Compare slider"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setPendingUrl(undefined);
                  setCompareOpen(false);
                }}
              >
                Discard change
              </Button>
              <Button onClick={() => setCompareOpen(false)}>Looks good</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
