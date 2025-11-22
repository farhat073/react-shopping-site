import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Upload, X, Star, GripVertical } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/common/Badge';
import { formatPrice } from '../utils/helpers';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories
} from '../api/admin';
import {
  uploadMultipleImages,
  saveProductImage,
  updateProductImage,
  deleteProductImage,
  reorderProductImages
} from '../services/storageService.js';
import type { Product, Category, ProductImage } from '../types';

interface UploadResult {
  publicUrl: string;
}

interface ProductFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  stock: number;
  published: boolean;
  category_id: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    price: 0,
    stock: 0,
    published: false,
    category_id: ''
  });

  // Image management state
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getAdminCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId: string;

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, formData);
        productId = editingProduct.id;
      } else {
        const newProduct = await createAdminProduct(formData);
        productId = newProduct.id;

        // Create image records for new product
        if (productImages.length > 0) {
          const imagePromises = productImages.map((image, index) =>
            saveProductImage(
              productId,
              image.url,
              image.alt_text || '',
              image.is_primary,
              index
            )
          );
          await Promise.all(imagePromises);
        }
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description,
      price: product.price,
      stock: product.stock,
      published: product.published,
      category_id: (product as Product & { category_id?: string }).category_id || ''
    });
    setProductImages(product.images || []);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteAdminProduct(productId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      short_description: '',
      description: '',
      price: 0,
      stock: 0,
      published: false,
      category_id: ''
    });
    setEditingProduct(null);
    setProductImages([]);
    setShowForm(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Image handling functions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return;

    setUploadingImages(true);
    setError(null);

    try {
      // Upload images to storage
      const uploadResults: UploadResult[] = await uploadMultipleImages(files);

      // Save image records to database (if editing existing product)
      if (editingProduct) {
        const imagePromises = uploadResults.map((result: UploadResult, index: number) =>
          saveProductImage(
            editingProduct.id,
            result.publicUrl,
            '', // alt text
            productImages.length === 0 && index === 0, // first image as primary if no images exist
            productImages.length + index
          )
        );

        const savedImages = await Promise.all(imagePromises);
        setProductImages(prev => [...prev, ...savedImages]);
      } else {
        // For new products, store temporarily until product is created
        const tempImages = uploadResults.map((result: UploadResult, index: number) => ({
          id: `temp-${Date.now()}-${index}`,
          product_id: 'temp',
          url: result.publicUrl,
          alt_text: '',
          is_primary: productImages.length === 0 && index === 0,
          display_order: productImages.length + index,
          created_at: new Date().toISOString()
        }));
        setProductImages(prev => [...prev, ...tempImages]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageUpload(Array.from(e.target.files));
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!editingProduct) return;

    try {
      await updateProductImage(imageId, { is_primary: true });
      setProductImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.id === imageId }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingProduct) {
      // For new products, just remove from state
      setProductImages(prev => prev.filter(img => img.id !== imageId));
      return;
    }

    try {
      await deleteProductImage(imageId);
      setProductImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleReorderImages = async (imageOrder: { id: string; display_order: number }[]) => {
    if (!editingProduct) return;

    try {
      await reorderProductImages(imageOrder);
      // Update local state
      setProductImages(prev =>
        prev.map(img => {
          const orderItem = imageOrder.find(item => item.id === img.id);
          return orderItem ? { ...img, display_order: orderItem.display_order } : img;
        }).sort((a, b) => a.display_order - b.display_order)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder images');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Product Management">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products ({products.length})</h2>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Product
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Images
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="font-medium text-primary-600 hover:text-primary-500">
                          Click to upload
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                    {uploadingImages && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
                      </div>
                    )}
                  </div>

                  {/* Image Gallery */}
                  {productImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productImages
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt_text || 'Product image'}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                {!image.is_primary && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetPrimaryImage(image.id)}
                                    className="p-1"
                                    title="Set as primary"
                                  >
                                    <Star size={12} />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="p-1"
                                  title="Delete image"
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            </div>
                            {image.is_primary && (
                              <div className="absolute top-1 right-1 bg-primary-500 text-white rounded-full p-1">
                                <Star size={10} fill="currentColor" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">No Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                    Published
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt_text || product.title}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category?.name || 'No Category'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price, product.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={product.published ? 'success' : 'secondary'}>
                        {product.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="p-1"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add your first product
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductManagement;