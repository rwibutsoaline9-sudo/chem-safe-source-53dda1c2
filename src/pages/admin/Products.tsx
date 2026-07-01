import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ShieldAlert, Upload, X, ImageIcon, Loader2, FolderOpen, Camera } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ImageLibraryPicker } from '@/components/admin/ImageLibraryPicker';
import { QuickImageEditor } from '@/components/admin/QuickImageEditor';

const SUPABASE_URL = "https://lriwodanoclewwjrsimi.supabase.co";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purity: '',
    grade: '',
    cas_number: '',
    description: '',
    price_value: '',
    price_unit: 'kg',
    price_currency: 'USD',
    is_restricted: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Error fetching products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleUploadImages = async (files: FileList) => {
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
      } else {
        const url = `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;
        uploaded.push(url);
      }
    }

    setImageUrls((prev) => [...prev, ...uploaded]);
    if (uploaded.length > 0) toast.success(`${uploaded.length} image(s) uploaded`);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the first uploaded image as image_url, store all in description or as first
    const image_url = imageUrls.length > 0 ? imageUrls[0] : null;

    // Prevent reusing the same uploaded image across different product names
    // unless the admin explicitly confirms the link.
    if (image_url && image_url.includes('/storage/v1/object/public/product-images/')) {
      const { data: dupes, error: dupeErr } = await supabase
        .from('products')
        .select('id, name')
        .eq('image_url', image_url);

      if (dupeErr) {
        toast.error('Could not verify image uniqueness');
        return;
      }

      const conflicts = (dupes || []).filter(
        (p) =>
          p.id !== editingProduct?.id &&
          p.name.trim().toLowerCase() !== formData.name.trim().toLowerCase()
      );

      if (conflicts.length > 0) {
        const names = conflicts.map((c) => `"${c.name}"`).join(', ');
        const ok = window.confirm(
          `This image is already used by a different product: ${names}.\n\n` +
            `Reusing the same photo across different product names can mislead customers. ` +
            `Click OK only if you explicitly want to link "${formData.name}" to the same image. ` +
            `Otherwise click Cancel and upload a unique image.`
        );
        if (!ok) return;
      }
    }

    const productData = {
      ...formData,
      price_value: parseFloat(formData.price_value),
      image_url,
    };


    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Error updating product');
      } else {
        toast.success('Product updated successfully');
        fetchProducts();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);

      if (error) {
        toast.error('Error creating product');
      } else {
        toast.success('Product created successfully');
        fetchProducts();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast.error('Error deleting product');
    } else {
      toast.success('Product deleted successfully');
      fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      purity: product.purity || '',
      grade: product.grade || '',
      cas_number: product.cas_number || '',
      description: product.description || '',
      price_value: product.price_value.toString(),
      price_unit: product.price_unit,
      price_currency: product.price_currency,
      is_restricted: product.is_restricted,
    });
    setImageUrls(product.image_url ? [product.image_url] : []);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setImageUrls([]);
    setFormData({
      name: '',
      category: '',
      purity: '',
      grade: '',
      cas_number: '',
      description: '',
      price_value: '',
      price_unit: 'kg',
      price_currency: 'USD',
      is_restricted: false,
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProduct(null); setImageUrls([]); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purity">Purity</Label>
                    <Input
                      id="purity"
                      value={formData.purity}
                      onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cas_number">CAS Number</Label>
                    <Input
                      id="cas_number"
                      value={formData.cas_number}
                      onChange={(e) => setFormData({ ...formData, cas_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_value">Price *</Label>
                    <Input
                      id="price_value"
                      type="number"
                      step="0.01"
                      value={formData.price_value}
                      onChange={(e) => setFormData({ ...formData, price_value: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_unit">Price Unit *</Label>
                    <Input
                      id="price_unit"
                      value={formData.price_unit}
                      onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleUploadImages(e.target.files)}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Click to upload images (multiple allowed)</span>
                        <span className="text-xs">JPG, PNG, WebP up to 5MB each</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setLibraryOpen(true)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Choose from image library
                  </Button>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_restricted"
                    checked={formData.is_restricted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_restricted: checked })
                    }
                  />
                  <Label htmlFor="is_restricted">Restricted Item</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url && product.image_url.startsWith('http') ? (
                        <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.purity || '-'}</TableCell>
                    <TableCell>
                      ${product.price_value}/{product.price_unit}
                    </TableCell>
                    <TableCell>
                      {product.is_restricted && (
                        <div className="flex items-center gap-1 text-red-500">
                          <ShieldAlert className="h-4 w-4" />
                          <span className="text-xs">Restricted</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          title="Change image"
                          onClick={() => setQuickEditProduct(product)}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ImageLibraryPicker
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        currentUrl={imageUrls[0]}
        onSelect={(url) => setImageUrls((prev) => [url, ...prev.filter((u) => u !== url)])}
      />

      <QuickImageEditor
        open={!!quickEditProduct}
        onOpenChange={(o) => !o && setQuickEditProduct(null)}
        product={quickEditProduct}
        onSaved={fetchProducts}
      />
    </AdminLayout>
  );
};

export default Products;
