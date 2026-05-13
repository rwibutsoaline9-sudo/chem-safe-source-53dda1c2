import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [restrictedFilter, setRestrictedFilter] = useState<string>("all");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (product.cas_number?.includes(searchQuery));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesRestricted = restrictedFilter === "all" || 
                             (restrictedFilter === "restricted" && product.is_restricted) ||
                             (restrictedFilter === "non-restricted" && !product.is_restricted);
    
    return matchesSearch && matchesCategory && matchesRestricted;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      <SEO
        title="Industrial Chemicals Catalog — ChemSupply Pro"
        description="Browse 200+ certified industrial chemicals: acids, solvents, polymers, salts. Bulk pricing, SDS, and KYC-verified shipping."
        path="/products"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,197,253,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F8FAFC,transparent_10%,transparent_90%,#F8FAFC)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6' fill-opacity='0.05'%3E%3Cpath d='M25 0L50 50H0L25 0zM25 50L0 0h50L25 50z'/%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }} />
        <div className="absolute inset-0 backdrop-blur-[80px]" />
      </div>
      <section className="relative bg-gradient-to-r from-blue-50/80 via-white/50 to-blue-50/80 py-6 sm:py-8 flex items-center backdrop-blur-sm border-b border-blue-200/30">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-blue-100">Industrial Chemicals Catalog</h1>
          <p className="text-xs sm:text-sm text-blue-400/80">
            Browse our comprehensive selection of high-quality chemicals
          </p>
        </div>
      </section>

      <section className="py-4 sm:py-6 md:py-8 border-b border-blue-500/10 backdrop-blur-sm bg-blue-950/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400/60 w-4 h-4 group-hover:text-blue-400/80 transition-colors" />
              <Input
                placeholder="Search by name, CAS number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-blue-950/20 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/30 focus:border-blue-400/50 transition-all text-blue-100 placeholder:text-blue-400/50 text-sm"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={restrictedFilter} onValueChange={setRestrictedFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Restriction Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="non-restricted">Non-Restricted</SelectItem>
                <SelectItem value="restricted">Restricted Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 md:py-12 relative">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-blue-400/70">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-blue-400/70">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-blue-300 mb-4 sm:mb-6 backdrop-blur-sm bg-blue-950/30 inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-blue-500/20">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 relative bg-gradient-to-b from-transparent via-blue-950/10 to-transparent py-4 sm:py-6 md:py-8 rounded-2xl">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
