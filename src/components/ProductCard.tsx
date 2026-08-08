import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowUpRight, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { getProductImage, getProductImageStyle } from "@/lib/productImages";
import { toSlug } from "@/lib/slug";

interface Product {
  id: string;
  name: string;
  category: string;
  purity: string | null;
  grade: string | null;
  cas_number: string | null;
  description: string | null;
  price_value: number;
  price_unit: string;
  price_currency: string;
  is_restricted: boolean;
  image_url: string | null;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const imageSrc = getProductImage(product.image_url, product.category, product.name);
  const productSlug = toSlug(product.name);

  return (
    <Link to={`/products/${productSlug}`} className="group block h-full focus:outline-none">
      <Card className="h-full flex flex-col overflow-hidden rounded-xl border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageSrc}
            alt={`${product.name} — industrial grade chemical`}
            loading="lazy"
            decoding="async"
            style={getProductImageStyle(product.name, product.image_url)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-80" />

          <Badge
            variant="secondary"
            className="absolute left-2 top-2 max-w-[85%] truncate border border-border bg-background text-[10px] font-semibold text-foreground shadow-sm sm:text-xs"
          >
            {product.category}
          </Badge>


          {product.is_restricted && (
            <Badge
              variant="destructive"
              className="absolute right-2 top-2 flex items-center gap-1 px-1.5 py-0 text-[10px] sm:text-xs"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Restricted</span>
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
            {product.name}
          </h3>

          <div className="flex flex-wrap gap-1">
            {product.purity && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                {product.purity}
              </span>
            )}
            {product.grade && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                {product.grade}
              </span>
            )}
          </div>

          {product.cas_number && (
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              CAS <span className="font-mono">{product.cas_number}</span>
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary sm:text-base">
                ${product.price_value.toLocaleString()}
              </p>
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                {product.price_currency} / {product.price_unit}
              </p>
            </div>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
