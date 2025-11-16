import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles, ShoppingCart, Star, TrendingUp, Menu, User, LogOut, Package } from 'lucide-react';
import { fetchProducts } from '../api/products';
import { useProductFilters } from '../hooks/useProductFilters';
import { ProductGrid } from '../components/product/ProductGrid';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getAssetUrl, formatPrice } from '../utils/helpers';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../utils/constants';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { Product } from '../types';

// Featured 3D Product Card Component
const Featured3DCard = ({ product, index }: { product: Product; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7.5, -7.5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7.5, 7.5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    x.set(distanceX / (rect.width / 2));
    y.set(distanceY / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group"
    >
      <Link to={`/product/${product.slug}`}>
        <Card className="overflow-hidden hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 h-full bg-white/80 backdrop-blur-sm">
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
            <motion.div
              whileHover={{ scale: 1.1, z: 20 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={product.images && product.images.length > 0 ? getAssetUrl(product.images[0].id) : '/placeholder.jpg'}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
            />
          </div>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price, product.currency)}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

// Swirling Dress Component
const SwirlingDress = ({ index, delay = 0 }: { index: number; delay?: number }) => {
  const [windowWidth, setWindowWidth] = useState(1920);
  
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dressVariants = [
    // Dress 1: Flowing dress
    <svg key={0} width="120" height="200" viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 20 Q50 40 50 80 Q50 120 45 160 Q45 180 50 200 M60 20 Q70 40 70 80 Q70 120 75 160 Q75 180 70 200" stroke={`url(#grad1-${index})`} strokeWidth="3" fill={`url(#fill1-${index})`} opacity="0.6"/>
      <defs>
        <linearGradient id={`grad1-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`fill1-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>,
    // Dress 2: A-line dress
    <svg key={1} width="100" height="180" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L30 50 Q25 80 30 120 Q35 160 45 180 M50 10 L70 50 Q75 80 70 120 Q65 160 55 180 M30 50 L70 50" stroke={`url(#grad2-${index})`} strokeWidth="2.5" fill={`url(#fill2-${index})`} opacity="0.5"/>
      <defs>
        <linearGradient id={`grad2-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={`fill2-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>,
    // Dress 3: Elegant gown
    <svg key={2} width="110" height="220" viewBox="0 0 110 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M55 5 Q45 30 40 70 Q35 110 38 150 Q40 180 50 220 M55 5 Q65 30 70 70 Q75 110 72 150 Q70 180 60 220" stroke={`url(#grad3-${index})`} strokeWidth="3" fill={`url(#fill3-${index})`} opacity="0.55"/>
      <defs>
        <linearGradient id={`grad3-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`fill3-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.28" />
        </linearGradient>
      </defs>
    </svg>,
    // Dress 4: Flared dress
    <svg key={3} width="95" height="170" viewBox="0 0 95 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.5 15 Q40 45 38 75 Q36 105 32 135 Q28 155 35 170 M47.5 15 Q55 45 57 75 Q59 105 63 135 Q67 155 60 170" stroke={`url(#grad4-${index})`} strokeWidth="2.5" fill={`url(#fill4-${index})`} opacity="0.5"/>
      <defs>
        <linearGradient id={`grad4-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={`fill4-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>,
    // Dress 5: Ball gown
    <svg key={4} width="130" height="210" viewBox="0 0 130 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M65 8 Q55 35 50 70 Q45 105 42 140 Q40 170 48 210 M65 8 Q75 35 80 70 Q85 105 88 140 Q90 170 82 210" stroke={`url(#grad5-${index})`} strokeWidth="3" fill={`url(#fill5-${index})`} opacity="0.6"/>
      <defs>
        <linearGradient id={`grad5-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`fill5-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>,
  ];

  const dress = dressVariants[index % dressVariants.length];
  const speed = 15 + (index % 3) * 5; // Different speeds
  const startX = -200;
  const endX = windowWidth + 200;
  const verticalPos = 20 + (index % 5) * 18; // Staggered vertical positions

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ x: startX, y: `${verticalPos}%`, rotate: -15 - (index % 5) * 5, opacity: 0.4 }}
      animate={{
        x: endX,
        y: [
          `${verticalPos}%`,
          `${verticalPos + 5}%`,
          `${verticalPos - 3}%`,
          `${verticalPos + 2}%`,
          `${verticalPos}%`,
        ],
        rotate: [
          -15 - (index % 5) * 5,
          10 + (index % 3) * 5,
          -8 - (index % 4) * 3,
          5 + (index % 2) * 4,
          -15 - (index % 5) * 5,
        ],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.4, 0.6, 0.5, 0.55, 0.4],
      }}
      transition={{
        x: {
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          delay: delay,
        },
        y: {
          duration: 3 + (index % 3),
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        rotate: {
          duration: 4 + (index % 3) * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        scale: {
          duration: 3 + (index % 2) * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
        opacity: {
          duration: 4 + (index % 2),
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay,
        },
      }}
      style={{
        filter: 'blur(0.5px)',
      }}
    >
      {dress}
    </motion.div>
  );
};

export const Home = () => {
  const { filters, categories, updateFilter, clearFilters } = useProductFilters();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 100);
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProducts = await fetchProducts(filters);
        setProducts(fetchedProducts);
        
        // Get featured products (first 8)
        const featured = fetchedProducts.slice(0, 8);
        setFeaturedProducts(featured);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Welcome to Our Store - Quality Products at Great Prices</title>
        <meta name="description" content="Discover amazing products at great prices. Quality and style that you'll love. Shop our curated collection of premium products." />
        <meta property="og:title" content="Welcome to Our Store - Quality Products at Great Prices" />
        <meta property="og:description" content="Discover amazing products at great prices. Quality and style that you'll love." />
        <meta property="og:image" content="/og-image-home.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen bg-white" style={{ position: 'relative' }}>
        {/* Premium Hero Section with 3D Clothing Animation */}
        <section 
          ref={heroRef}
          className="relative overflow-hidden min-h-[90vh] flex items-center justify-center"
          style={{ perspective: '1000px', position: 'relative' }}
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50/30 to-white" style={{ position: 'absolute' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_50%)]" style={{ position: 'absolute' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.12),transparent_50%)]" style={{ position: 'absolute' }} />
            <motion.div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.15), transparent 70%)",
                position: 'absolute',
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>

          {/* Swirling Dresses with Frosted Glass Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Frosted glass overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-[2px] bg-white/5"
              style={{
                WebkitBackdropFilter: 'blur(2px)',
              }}
            />
            
            {/* Swirling dresses */}
            {[...Array(6)].map((_, i) => (
              <SwirlingDress key={i} index={i} delay={i * 2} />
            ))}
          </div>

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full blur-3xl ${
                  i % 2 === 0 
                    ? 'bg-gradient-to-br from-purple-500/25 to-purple-600/20' 
                    : 'bg-gradient-to-br from-pink-500/25 to-fuchsia-500/20'
                }`}
                style={{
                  width: `${200 + i * 100}px`,
                  height: `${200 + i * 100}px`,
                  left: `${(i * 15) % 80}%`,
                  top: `${(i * 20) % 80}%`,
                }}
                animate={{
                  x: [0, 50, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Header in Hero Section - Transparent to Glass Pill */}
          <motion.header
            ref={headerRef}
            className={`fixed left-1/2 transform -translate-x-1/2 z-[1000] w-[95%] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
              isScrolled ? 'top-0' : 'top-4'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{ 
              opacity: { duration: 0.6, delay: 0.1 },
              y: { duration: 0.6, delay: 0.1 },
            }}
          >
            <motion.div
              className="flex justify-between items-center px-4 sm:px-6 py-3 transition-all duration-300"
              animate={{
                backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0)',
                backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
                borderRadius: isScrolled ? '9999px' : '0px',
                borderWidth: isScrolled ? '1px' : '0px',
                borderColor: isScrolled ? 'rgba(192, 132, 252, 0.3)' : 'rgba(192, 132, 252, 0)',
                boxShadow: isScrolled ? '0 8px 32px rgba(147, 51, 234, 0.2), 0 0 0 1px rgba(192, 132, 252, 0.1)' : 'none',
                paddingLeft: isScrolled ? '1.5rem' : '0',
                paddingRight: isScrolled ? '1.5rem' : '0',
              }}
              style={{
                WebkitBackdropFilter: isScrolled ? 'blur(10px)' : 'none',
              }}
            >
              {/* Logo - Left */}
              <Link to="/" className="flex items-center z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-300"
                  animate={{
                    color: isScrolled ? '#f3f4f6' : '#1f2937',
                  }}
                >
                  {SITE_CONFIG.name}
                </motion.div>
              </Link>

              {/* Right side - Navigation, Cart, Auth */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
                  <Link
                    to="/"
                    className="text-sm font-medium transition-colors duration-300"
                    style={{
                      color: isScrolled ? '#f3f4f6' : '#374151',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#e9d5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isScrolled ? '#f3f4f6' : '#374151';
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className="text-sm font-medium transition-colors duration-300"
                    style={{
                      color: isScrolled ? '#f3f4f6' : '#374151',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#e9d5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isScrolled ? '#f3f4f6' : '#374151';
                    }}
                  >
                    About
                  </Link>
                </nav>

                {/* Cart Icon */}
                <Link to="/cart" className="relative" aria-label={`Shopping cart with ${itemCount} items`}>
                  <motion.div
                    whileHover={{ scale: 1.1, color: '#e9d5ff' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 transition-colors duration-300"
                    animate={{
                      color: isScrolled ? '#f3f4f6' : '#374151',
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    {itemCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {itemCount > 9 ? '9+' : itemCount}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                </Link>

                {/* Auth Buttons */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hidden md:flex items-center gap-2 transition-colors duration-300"
                        style={{
                          color: isScrolled ? '#f3f4f6' : undefined,
                        }}
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">{user?.first_name || user?.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                        {user?.first_name && user?.last_name && (
                          <p className="text-xs text-gray-500">{user.first_name} {user.last_name}</p>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="flex items-center w-full">
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                      className="transition-colors duration-300"
                      style={{
                        color: isScrolled ? '#f3f4f6' : undefined,
                      }}
                    >
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      asChild
                      className="transition-all duration-300"
                      style={{
                        backgroundColor: isScrolled ? 'rgba(168, 85, 247, 0.8)' : undefined,
                        borderColor: isScrolled ? 'rgba(168, 85, 247, 0.5)' : undefined,
                      }}
                    >
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <motion.div
                      animate={{
                        color: isScrolled ? '#f3f4f6' : undefined,
                      }}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="transition-colors duration-300"
                      >
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-900 hover:text-gray-700"
                      >
                        Home
                      </Link>
                      <Link
                        to="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-900 hover:text-gray-700"
                      >
                        About
                      </Link>
                      {user ? (
                        <>
                          <Link
                            to="/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-base font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2"
                          >
                            <Package className="h-4 w-4" />
                            My Orders
                          </Link>
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                            <Button
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                          <Button variant="outline" className="w-full" asChild>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                          </Button>
                          <Button variant="default" className="w-full" asChild>
                            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          </motion.header>

          {/* Hero Content */}
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24"
            style={{ opacity, scale }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Main Heading */}
              <motion.h1
                className="text-6xl md:text-8xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Discover Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Shop the latest trends and timeless classics. Quality products
                <br className="hidden md:block" />
                curated just for you, delivered with excellence.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/#products')}
                  className="group px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/#products')}
                  className="px-8 py-6 text-lg font-semibold border-2 border-purple-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm text-purple-700 hover:text-purple-800"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore Collection
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {[
                  { label: 'Products', value: products.length || '100+' },
                  { label: 'Happy Customers', value: '10K+' },
                  { label: 'Categories', value: categories.length || '15+' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* Featured Products Showcase with 3D Effects */}
        {featuredProducts.length > 0 && (
          <section id="products" className="py-24 bg-gradient-to-b from-white via-purple-50/20 to-gray-50" style={{ position: 'relative' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-500/30">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  Featured Collection
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                  Handpicked for You
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                  Discover our most popular and trending products, carefully selected
                  <br className="hidden md:block" />
                  to bring you the best shopping experience.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                style={{ perspective: '1000px' }}
              >
                <AnimatePresence>
                  {featuredProducts.slice(0, 4).map((product, index) => (
                    <Featured3DCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </section>
        )}

        {/* Filters Section */}
        <section id="all-products" className="py-16 bg-gray-50" style={{ position: 'relative' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={filters.search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice || ''}
                        onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>

                    {/* Max Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={filters.maxPrice || ''}
                        onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Sort By</label>
                      <select
                        value={filters.sort}
                        onChange={(e) => updateFilter('sort', e.target.value)}
                        className="flex h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-white" style={{ position: 'relative' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                All Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
                Explore our complete collection of high-quality products
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <Card className="max-w-md mx-auto bg-red-50">
                  <CardContent className="p-6">
                    <p className="text-red-600 mb-4 font-medium">Failed to load products: {error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="default"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <ProductGrid products={products} loading={loading} />
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};
