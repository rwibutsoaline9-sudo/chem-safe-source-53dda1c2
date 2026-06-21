import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { computeDHash, hammingDistance } from "@/lib/imageHash";
import { getProductImage } from "@/lib/productImages";
import { toast } from "sonner";
import { AlertTriangle, ScanSearch } from "lucide-react";

interface ProductRow {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  image_url: string | null;
}

interface Hashed extends ProductRow {
  hash: string;
  resolvedUrl: string;
}

interface SimilarPair {
  a: Hashed;
  b: Hashed;
  distance: number;
}

const ImageSimilarity = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [hashed, setHashed] = useState<Hashed[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, category, image_url")
        .order("name");
      if (error) {
        toast.error("Failed to load products");
        return;
      }
      setProducts(data || []);
    })();
  }, []);

  const runScan = async () => {
    setScanning(true);
    setHashed([]);
    setProgress(0);
    const results: Hashed[] = [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const url = getProductImage(p.image_url, p.category);
      const hash = await computeDHash(url);
      if (hash) results.push({ ...p, hash, resolvedUrl: url });
      setProgress(Math.round(((i + 1) / products.length) * 100));
    }
    setHashed(results);
    setScanning(false);
    toast.success(`Hashed ${results.length} of ${products.length} images`);
  };

  const pairs = useMemo<SimilarPair[]>(() => {
    const out: SimilarPair[] = [];
    for (let i = 0; i < hashed.length; i++) {
      for (let j = i + 1; j < hashed.length; j++) {
        const a = hashed[i];
        const b = hashed[j];
        // Skip if same product name root (likely intentional variant)
        if (a.name.trim().toLowerCase() === b.name.trim().toLowerCase()) continue;
        const distance = hammingDistance(a.hash, b.hash);
        if (distance <= threshold) out.push({ a, b, distance });
      }
    }
    return out.sort((x, y) => x.distance - y.distance);
  }, [hashed, threshold]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ScanSearch className="h-7 w-7" /> Image Similarity Scan
          </h1>
          <p className="text-muted-foreground mt-1">
            Detects product images that look visually similar using perceptual hashing (dHash).
            Lower distance = more similar. Identical images = 0.
          </p>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">{products.length} products loaded</p>
              {hashed.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {hashed.length} hashed · {pairs.length} flagged at threshold ≤ {threshold}
                </p>
              )}
            </div>
            <Button onClick={runScan} disabled={scanning || products.length === 0}>
              {scanning ? "Scanning…" : "Run scan"}
            </Button>
          </div>

          {scanning && <Progress value={progress} />}

          <div>
            <label className="text-sm font-medium">
              Similarity threshold (Hamming distance): {threshold}
            </label>
            <Slider
              value={[threshold]}
              onValueChange={(v) => setThreshold(v[0])}
              min={0}
              max={20}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              0–5 = nearly identical · 6–10 = likely duplicate · 11–20 = loosely similar
            </p>
          </div>
        </Card>

        {pairs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Flagged pairs ({pairs.length})
            </h2>
            {pairs.map(({ a, b, distance }) => (
              <Card key={`${a.id}-${b.id}`} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    Distance: <span className="text-amber-600">{distance}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[a, b].map((p) => (
                    <div key={p.id} className="flex gap-3 items-start">
                      <img
                        src={p.resolvedUrl}
                        alt={p.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                        <Link
                          to={`/products/${p.slug || p.id}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline"
                        >
                          View product →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!scanning && hashed.length > 0 && pairs.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            No similar image pairs found at the current threshold. 🎉
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ImageSimilarity;
