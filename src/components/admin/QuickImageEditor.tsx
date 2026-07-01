import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, ImageIcon, FolderOpen, Trash2 } from "lucide-react";
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

  if (!product) return null;

  const currentUrl = pendingUrl !== undefined ? pendingUrl : product.image_url;
  const previewSrc = currentUrl
    ? currentUrl.startsWith("http")
      ? currentUrl
      : getProductImage(currentUrl, product.category, product.name)
    : getProductImage(null, product.category, product.name);

  const handleUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
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

    // Duplicate check
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Set image — {product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted border">
              <img src={previewSrc} alt={product.name} className="w-full h-full object-cover" />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setLibraryOpen(true)}
              >
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
              <Button onClick={handleSave} disabled={saving || pendingUrl === undefined}>
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
    </>
  );
};
