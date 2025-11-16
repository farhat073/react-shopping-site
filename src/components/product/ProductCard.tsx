import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getAssetUrl } from '../../utils/helpers';
import { LazyImage } from '../common/LazyImage';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isInCart, buyNow } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    await buyNow(product);
  };

  const imageUrl = product.images && product.images.length > 0
    ? getAssetUrl(product.images[0].id)
    : '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:border-purple-500">
        <Link to={`/product/${product.slug}`} className="block" aria-label={`View details for ${product.title}`}>
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              <LazyImage
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-sm font-semibold">
                  Out of Stock
                </Badge>
              </div>
            )}
            {new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
              <div className="absolute top-3 left-3">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  New
                </Badge>
              </div>
            )}
            {product.category && (
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="text-xs">
                  {product.category.name}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <h2 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-tight">
                {product.title}
              </h2>

              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {product.short_description || product.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.stock > 0 && (
                  <span className="text-xs text-gray-500">
                    {product.stock} in stock
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Link>

        <div className="px-5 pb-5 space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label={isInCart(product.id) ? `Remove ${product.title} from cart` : `Add ${product.title} to cart`}
            className={`w-full ${
              isInCart(product.id)
                ? 'bg-green-600 hover:bg-green-700'
                : ''
            }`}
            variant={isInCart(product.id) ? 'default' : 'default'}
            size="default"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock <= 0 ? 'Out of Stock' : isInCart(product.id) ? '✓ Added to Cart' : 'Add to Cart'}
          </Button>

          <Button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            aria-label={`Buy ${product.title} now`}
            variant="outline"
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            size="default"
          >
            <Zap className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};