import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toSlug } from "@/lib/slug";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Download, Package, Beaker, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getProductImage, getProductImageStyle } from "@/lib/productImages";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductFAQ } from "@/components/ProductFAQ";

interface Product {
  id: string;
  name: string;
  category: string;
  purity: string | null;
  grade: string | null;
  cas_number: string | null;
  description: string | null;
  applications: string[] | null;
  packaging: string[] | null;
  price_value: number;
  price_unit: string;
  price_currency: string;
  is_restricted: boolean;
  image_url: string | null;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

      const query = isUuid
        ? supabase.from('products').select('*').eq('id', slug)
        : supabase.from('products').select('*').eq('slug', slug);

      let { data } = await query.maybeSingle();

      if (!data && !isUuid) {
        const { data: all } = await supabase.from('products').select('*');
        data = (all?.find((p: any) => toSlug(p.name) === slug) ?? null) as any;
      }

      setProduct(data as Product | null);
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  // Inject Product JSON-LD for SEO
  useEffect(() => {
    if (!product) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description ?? `${product.name} — industrial chemical supplied by ChemSupply Pro.`,
      category: product.category,
      sku: product.cas_number ?? product.id,
      image: product.image_url ?? undefined,
      brand: { "@type": "Brand", name: "ChemSupply Pro" },
      offers: {
        "@type": "Offer",
        priceCurrency: product.price_currency,
        price: product.price_value,
        availability: "https://schema.org/InStock",
        url: typeof window !== "undefined" ? window.location.href : undefined,
        seller: { "@type": "Organization", name: "ChemSupply Pro" },
      },
    });
    script.id = "product-jsonld";
    document.getElementById("product-jsonld")?.remove();
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageSrc = getProductImage(product.image_url, product.category);

  const handleDownloadSDS = () => {
    toast.info("SDS download will be available upon quote request verification");
  };

  const seoTitle = `${product.name} — ChemSupply Pro`.slice(0, 60);
  const seoDesc = (product.description?.trim() ||
    `Buy ${product.name} (${product.category}) from ChemSupply Pro. Bulk pricing, certified purity, full SDS & compliance.`).slice(0, 160);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/products/${slug}`}
        image={product.image_url ?? undefined}
        type="product"
      />
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: product.name, path: `/products/${slug}` },
            ]}
          />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-6">
                <img 
                  src={imageSrc} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.is_restricted && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive mb-1">Restricted Chemical</p>
                        <p className="text-sm text-muted-foreground">
                          This product requires business license verification and proper documentation. 
                          Please ensure compliance with local regulations before requesting a quote.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold">{product.name}</h1>
                {product.is_restricted && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Restricted
                  </Badge>
                )}
              </div>

              <div className="space-y-6 mb-8">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Price</p>
                    <p className="text-3xl font-bold text-primary">
                      {product.price_currency} ${product.price_value.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{product.price_unit}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    {product.purity && (
                      <div className="flex items-center gap-3 text-sm">
                        <Beaker className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">Purity</p>
                          <p className="text-muted-foreground">{product.purity}</p>
                        </div>
                      </div>
                    )}
                    {product.grade && (
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">Grade</p>
                          <p className="text-muted-foreground">{product.grade}</p>
                        </div>
                      </div>
                    )}
                    {product.cas_number && (
                      <div className="flex items-center gap-3 text-sm">
                        <Package className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">CAS Number</p>
                          <p className="text-muted-foreground">{product.cas_number}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {product.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  </div>
                )}

                {product.applications && product.applications.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Applications</h2>
                    <div className="flex flex-wrap gap-2">
                      {product.applications.map((app, index) => (
                        <Badge key={index} variant="secondary">{app}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.packaging && product.packaging.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Available Packaging</h2>
                    <ul className="space-y-2">
                      {product.packaging.map((pkg, index) => (
                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                          <Package className="w-4 h-4 text-primary" />
                          {pkg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="flex-1">
                  <Button size="lg" className="w-full">
                    Request Quote
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleDownloadSDS}
                  className="flex-1"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download SDS
                </Button>
              </div>
            </div>
          </div>

          <ProductFAQ
            product={product}
            pageUrl={`https://chem-safe-source.lovable.app/products/${slug}`}
          />
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
