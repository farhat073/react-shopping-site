import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ShoppingBag } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/products/ProductFilter';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useProductFilters } from '../hooks/useProductFilters';
import { getFilteredProducts } from '../api/products';
import type { Product } from '../types';

const Shop = () => {
  const {
    filters,
    categories,
    filterOptions,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    hasActiveFilters
  } = useProductFilters();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const filteredProducts = await getFilteredProducts(filters);
        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Update filter immediately for real-time search
    updateFilter('search', value);
  };

  return (
    <>
      <Helmet>
        <title>Shop - Browse Our Collection</title>
        <meta name="description" content="Browse our complete collection of products with advanced filtering and search options." />
        <meta property="og:title" content="Shop - Browse Our Collection" />
        <meta property="og:description" content="Browse our complete collection of products with advanced filtering and search options." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/shop" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-900" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
                <p className="text-gray-600 mt-1">
                  Discover our complete collection of products
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-gray-900 rounded-xl"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.search}"
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                    <button
                      onClick={() => updateFilter('category', '')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(filters.sizes || []).length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Sizes: {(filters.sizes || []).join(', ')}
                    <button
                      onClick={() => updateFilter('sizes', [])}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(filters.colors || []).length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Colors: {(filters.colors || []).join(', ')}
                    <button
                      onClick={() => updateFilter('colors', [])}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(filters.brands || []).length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Brands: {(filters.brands || []).join(', ')}
                    <button
                      onClick={() => updateFilter('brands', [])}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    In Stock Only
                    <button
                      onClick={() => updateFilter('inStock', false)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <ProductFilter
                filters={filters}
                filterOptions={filterOptions}
                categories={categories}
                onUpdateFilter={updateFilter}
                onToggleArrayFilter={toggleArrayFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters()}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {loading ? 'Loading...' : `${products.length} Product${products.length !== 1 ? 's' : ''}`}
                  </h2>
                  {filters.sort && (
                    <Badge variant="outline">
                      Sorted by: {filters.sort.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <ProductFilter
                    filters={filters}
                    filterOptions={filterOptions}
                    categories={categories}
                    onUpdateFilter={updateFilter}
                    onToggleArrayFilter={toggleArrayFilter}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters()}
                  />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <Card className="mb-6 bg-red-50 border-red-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-red-600 mb-4 font-medium">
                        Failed to load products: {error}
                      </p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="default"
                      >
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Products Grid */}
              <ProductGrid products={products} loading={loading} />

              {/* No Results */}
              {!loading && !error && products.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or clearing some filters.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;