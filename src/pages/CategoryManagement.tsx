import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '../api/admin';
import type { Category } from '../types';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

type AdminCategory = Category & { description?: string; created_at?: string };

const CategoryManagement = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCategories();
      setCategories(data as AdminCategory[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, formData);
      } else {
        await createAdminCategory(formData);
      }
      await loadCategories();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect products.')) return;
    try {
      await deleteAdminCategory(categoryId);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="Category Management">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories ({categories.length})</h2>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Update' : 'Create'} Category
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                      className="p-1"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                {category.description && (
                   <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                 )}
                 <div className="text-xs text-gray-400">
                   Created: {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                 </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No categories found.</p>
            <Button onClick={() => setShowForm(true)}>
              Add your first category
            </Button>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;