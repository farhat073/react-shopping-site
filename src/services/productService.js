import supabase from '../lib/supabase.js';

/**
 * Fetch all published products with their images and variants
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async () => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sort images by display_order and mark primary
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images
        .sort((a, b) => a.display_order - b.display_order)
        .map(img => ({ ...img, is_primary: img.is_primary })),
      variants: product.variants || []
    }));

    return processedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by slug with images and variants
 * @param {string} slug - Product slug
 * @returns {Promise<Object|null>} Product object or null
 */
export const fetchProductBySlug = async (slug) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Sort images by display_order
    return {
      ...product,
      images: product.images.sort((a, b) => a.display_order - b.display_order),
      variants: product.variants || []
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Fetch products by category
 * @param {string} categorySlug - Category slug
 * @returns {Promise<Array>} Array of products
 */
export const fetchProductsByCategory = async (categorySlug) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('published', true)
      .eq('category.slug', categorySlug)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return products.map(product => ({
      ...product,
      images: product.images.sort((a, b) => a.display_order - b.display_order),
      variants: product.variants || []
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

/**
 * Search products by title or description
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of products
 */
export const searchProducts = async (query) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return products.map(product => ({
      ...product,
      images: product.images.sort((a, b) => a.display_order - b.display_order),
      variants: product.variants || []
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Fetch products with advanced filtering options
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Search query for title/description
 * @param {string} filters.category - Category slug
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {string[]} filters.sizes - Array of size values
 * @param {string[]} filters.colors - Array of color values
 * @param {string[]} filters.brands - Array of brand values
 * @param {boolean} filters.inStock - Only show products with stock > 0
 * @param {string} filters.sort - Sort option ('newest', 'oldest', 'price-low', 'price-high', 'name-a-z', 'name-z-a')
 * @returns {Promise<Array>} Array of filtered products
 */
export const fetchFilteredProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('published', true);

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category.slug', filters.category);
    }

    // Apply price range filters
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      query = query.gte('price', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      query = query.lte('price', parseFloat(filters.maxPrice));
    }

    // Apply stock filter
    if (filters.inStock) {
      query = query.gt('stock', 0);
    }

    // Apply sorting
    const sortOptions = {
      'newest': ['created_at', { ascending: false }],
      'oldest': ['created_at', { ascending: true }],
      'price-low': ['price', { ascending: true }],
      'price-high': ['price', { ascending: false }],
      'name-a-z': ['title', { ascending: true }],
      'name-z-a': ['title', { ascending: false }]
    };

    const sortOption = sortOptions[filters.sort] || sortOptions.newest;
    query = query.order(sortOption[0], sortOption[1]);

    const { data: products, error } = await query;

    if (error) throw error;

    // Process products and apply variant filters client-side
    let processedProducts = products.map(product => ({
      ...product,
      images: product.images.sort((a, b) => a.display_order - b.display_order),
      variants: product.variants || []
    }));

    // Apply variant filters (size, color, brand)
    if (filters.sizes && filters.sizes.length > 0) {
      processedProducts = processedProducts.filter(product =>
        product.variants.some(variant =>
          variant.name.toLowerCase() === 'size' &&
          filters.sizes.includes(variant.value)
        )
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      processedProducts = processedProducts.filter(product =>
        product.variants.some(variant =>
          variant.name.toLowerCase() === 'color' &&
          filters.colors.includes(variant.value)
        )
      );
    }

    if (filters.brands && filters.brands.length > 0) {
      processedProducts = processedProducts.filter(product =>
        product.variants.some(variant =>
          variant.name.toLowerCase() === 'brand' &&
          filters.brands.includes(variant.value)
        )
      );
    }

    return processedProducts;
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    throw error;
  }
};

/**
 * Get available filter options from products
 * @returns {Promise<Object>} Object containing available filter options
 */
export const getFilterOptions = async () => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        price,
        variants:product_variants(name, value)
      `)
      .eq('published', true);

    if (error) throw error;

    const priceRange = {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price))
    };

    const sizes = new Set();
    const colors = new Set();
    const brands = new Set();

    products.forEach(product => {
      product.variants.forEach(variant => {
        const name = variant.name.toLowerCase();
        if (name === 'size') sizes.add(variant.value);
        else if (name === 'color') colors.add(variant.value);
        else if (name === 'brand') brands.add(variant.value);
      });
    });

    return {
      priceRange,
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      brands: Array.from(brands).sort()
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    throw error;
  }
};