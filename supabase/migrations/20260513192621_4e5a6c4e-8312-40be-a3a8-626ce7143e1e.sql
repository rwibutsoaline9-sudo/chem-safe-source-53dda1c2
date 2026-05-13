
-- Slug generator function
CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(regexp_replace(coalesce(value, ''), '[()]', '', 'g')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Add slug column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Backfill slugs uniquely
WITH numbered AS (
  SELECT id,
         public.slugify(name) AS base,
         row_number() OVER (PARTITION BY public.slugify(name) ORDER BY created_at, id) AS rn
  FROM public.products
)
UPDATE public.products p
SET slug = CASE WHEN n.rn = 1 THEN n.base ELSE n.base || '-' || n.rn::text END
FROM numbered n
WHERE p.id = n.id AND (p.slug IS NULL OR p.slug = '');

-- Enforce non-null + unique
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products(slug);

-- Trigger to auto-set slug on insert/update
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := public.slugify(NEW.name);
    IF base = '' THEN base := 'product'; END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_slug ON public.products;
CREATE TRIGGER products_set_slug
BEFORE INSERT OR UPDATE OF name, slug ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_product_slug();
