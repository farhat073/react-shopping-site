import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Zap, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/helpers';
import { LazyImage } from '../components/common/LazyImage';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { getProductBySlug } from '../api/products';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, buyNow } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductBySlug(slug);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          // TODO: Fetch related products
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await buyNow(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full"
        />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Product not found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)} variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.url)
    : ['/placeholder.jpg'];
  const currentImage = images[selectedImageIndex] || images[0];

  // Group variants by name
  const variantGroups = product.variants?.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {} as Record<string, typeof product.variants>) || {};

  // Calculate current price with variant modifiers
  const currentPrice = product.price + Object.entries(selectedVariants).reduce((total, [name, value]) => {
    const variant = product.variants?.find(v => v.name === name && v.value === value);
    return total + (variant?.price_modifier || 0);
  }, 0);

  return (
    <>
      <Helmet>
        <title>{product.title} - Wear Inn</title>
        <meta name="description" content={`${product.description.substring(0, 155)}...`} />
        <meta property="og:title" content={`${product.title} - Wear Inn`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={currentImage} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`/product/${product.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "description": product.description,
            "image": currentImage,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": product.currency || "USD",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
          >
            {/* Product Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden p-2">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="h-full w-full"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full w-full"
                      >
                        <LazyImage
                          src={currentImage}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.category && (
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                        {product.category.name}
                      </Badge>
                    )}
                    {new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Image Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                    {product.title}
                  </h1>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Badge
                    variant={product.stock > 0 ? "default" : "destructive"}
                    className={product.stock > 0 ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-gray-900">
                  {formatPrice(currentPrice, product.currency)}
                </span>
                {currentPrice !== product.price && (
                  <span className="text-2xl text-gray-500 line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
              </div>

              {/* Variant Selection */}
              {Object.keys(variantGroups).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                  {Object.entries(variantGroups).map(([name, variants]) => (
                    <div key={name} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">{name}</Label>
                      <RadioGroup
                        value={selectedVariants[name] || ''}
                        onValueChange={(value) => setSelectedVariants(prev => ({ ...prev, [name]: value }))}
                        className="flex flex-wrap gap-2"
                      >
                        {variants.map((variant) => (
                          <div key={variant.id} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={variant.value}
                              id={`${name}-${variant.value}`}
                              disabled={variant.stock <= 0}
                            />
                            <Label
                              htmlFor={`${name}-${variant.value}`}
                              className={`text-sm px-3 py-1 rounded-md border cursor-pointer ${
                                variant.stock <= 0
                                  ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                  : selectedVariants[name] === variant.value
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {variant.value}
                              {variant.price_modifier !== 0 && (
                                <span className="ml-1 text-xs">
                                  ({variant.price_modifier > 0 ? '+' : ''}{formatPrice(variant.price_modifier, product.currency)})
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {product.short_description && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-gray-700 font-medium leading-relaxed">{product.short_description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 ${
                    isInCart(product.id)
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isInCart(product.id) ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  variant="outline"
                  className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  size="lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-20"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;