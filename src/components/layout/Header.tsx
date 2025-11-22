import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { SITE_CONFIG } from '../../utils/constants';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

export const Header = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (isHomePage) {
      // On home page, only show frosted when scrolled
      setIsScrolled(latest > 50);
    } else {
      // On other pages, always show frosted
      setIsScrolled(true);
    }
  });

  // Reset scroll state when route changes
  useEffect(() => {
    if (isHomePage) {
      setIsScrolled(false);
    } else {
      setIsScrolled(true);
    }
  }, [location.pathname, isHomePage]);

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-purple-600/15 backdrop-blur-xl border-b border-purple-500/20 shadow-lg shadow-purple-500/10' 
          : 'bg-transparent border-b-0'
      }`}
      style={{
        WebkitBackdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'none',
        backdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'none',
      }}
      initial={false}
      animate={{
        backgroundColor: isScrolled ? 'rgba(147, 51, 234, 0.15)' : 'rgba(255, 255, 255, 0)',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold tracking-tight transition-colors duration-300"
              animate={{
                color: isScrolled ? '#f3f4f6' : '#1f2937',
              }}
            >
              {SITE_CONFIG.name}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
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

          {/* Right side */}
          <div className="flex items-center space-x-4">
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
                <ShoppingCart className="w-6 h-6" />
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
                    <span className="text-sm">{user?.full_name || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.full_name}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center w-full">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center w-full">
                          <User className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="ghost" 
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
                    <Menu className="h-6 w-6" />
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
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-base font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">{user?.email}</p>
                        <p className="text-xs text-gray-500 mb-2">{user?.full_name}</p>
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
        </div>
      </div>
    </motion.header>
  );
};
