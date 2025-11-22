import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserWishlist, removeFromWishlist } from '../api/wishlist';
import type { WishlistItem, Product } from '../types';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/helpers';
import { LazyImage } from '../components/common/LazyImage';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const items = await getUserWishlist(user.id);
        setWishlistItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await removeFromWishlist(user.id, productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const handleAddToCart = async (product: WishlistItem['product']) => {
    await addToCart(product as Product);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Your Wishlist
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please log in to view your saved products.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Wishlist - Wear Inn</title>
        <meta name="description" content="View and manage your saved products." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-8">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items in wishlist</h3>
                <p className="mt-1 text-sm text-gray-500">Start saving products you love!</p>
                <div className="mt-6">
                  <Link to="/" className="btn-primary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => {
                  const product = item.product;
                  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
                  const imageUrl = primaryImage?.url || '/placeholder.jpg';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <Link to={`/product/${product.slug}`} className="block">
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          <LazyImage
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/product/${product.slug}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>

                        <p className="text-lg font-bold text-gray-900 mb-3">
                          {formatPrice(product.price, product.currency)}
                        </p>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            className="flex-1"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>

                          <Button
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            variant="secondary"
                            size="sm"
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;