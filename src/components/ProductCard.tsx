import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { getProductImage } from "@/lib/productImages";

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
  const imageSrc = getProductImage(product.image_url, product.category);

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className="w-full h-[320px] sm:h-[350px] flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border cursor-pointer">
        <CardHeader className="p-0">
          <div className="w-full h-[100px] sm:h-[120px] overflow-hidden rounded-t-lg bg-muted">
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-2 sm:p-3 overflow-hidden">
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <CardTitle className="text-xs sm:text-sm line-clamp-2 pr-1">{product.name}</CardTitle>
            {product.is_restricted && (
              <Badge variant="destructive" className="flex items-center gap-0.5 text-[10px] sm:text-xs flex-shrink-0 px-1 py-0">
                <AlertTriangle className="w-2 h-2 hidden sm:inline" />
                <span className="sm:hidden">R</span>
                <span className="hidden sm:inline">Restricted</span>
              </Badge>
            )}
          </div>
          <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-muted-foreground">
            {product.purity && <p className="truncate"><span className="font-semibold text-foreground">Purity:</span> {product.purity}</p>}
            {product.grade && <p className="truncate"><span className="font-semibold text-foreground">Grade:</span> {product.grade}</p>}
            {product.cas_number && <p className="truncate"><span className="font-semibold text-foreground">CAS:</span> {product.cas_number}</p>}
            <p className="text-xs sm:text-sm font-bold text-primary mt-1 sm:mt-2 truncate">
              {product.price_currency} ${product.price_value.toLocaleString()} / {product.price_unit}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
