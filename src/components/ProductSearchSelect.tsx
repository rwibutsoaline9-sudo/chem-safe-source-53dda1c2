import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/productImages";
import { cn } from "@/lib/utils";

export interface SearchableProduct {
  id: string;
  name: string;
  price_value: number;
  price_unit: string;
  price_currency: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  category?: string | null;
}

const thumbFor = (p: SearchableProduct) =>
  getProductImage(p.image_urls?.[0] ?? p.image_url ?? null, p.category ?? "", p.name);

interface Props {
  products: SearchableProduct[];
  value: string;
  excludeIds?: string[];
  onSelect: (id: string) => void;
}

const ProductSearchSelect = ({ products, value, excludeIds = [], onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);
  const available = products.filter((p) => !excludeIds.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a product"
          className="w-full justify-between font-normal h-auto min-h-10 py-1.5"
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <img
                src={thumbFor(selected)}
                alt=""
                className="w-8 h-8 rounded object-cover shrink-0 bg-muted"
              />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" /> Search a product…
            </span>
          )}
          <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type to search products…" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {available.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  <img
                    src={thumbFor(p)}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0 bg-muted"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      ${p.price_value.toLocaleString()}/{p.price_unit}
                      {p.category ? ` · ${p.category}` : ""}
                    </span>
                  </span>
                  <Check className={cn("w-4 h-4 shrink-0", value === p.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProductSearchSelect;
