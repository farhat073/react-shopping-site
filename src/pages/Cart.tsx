import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { CartItem as CartItemType } from '../types';

export const Cart = () => {
  const { items, itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Wear Inn</title>
          <meta name="description" content="Your shopping cart is empty. Browse our products and add items to your cart to get started." />
          <meta property="og:title" content="Shopping Cart - Wear Inn" />
          <meta property="og:description" content="Your shopping cart is empty. Browse our products and add items to your cart." />
          <meta property="og:type" content="website" />
          <link rel="canonical" href="/cart" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            {location.state?.orderSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-green-800 font-semibold">Order placed successfully!</p>
                        <p className="text-green-600 text-sm">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <EmptyState
              icon={
                <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
              }
              title="Your cart is empty"
              description="Looks like you haven't added any products to your cart yet. Start shopping to fill it up!"
              actionLabel="Continue Shopping"
              onAction={() => navigate('/')}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${itemCount || 0} items) - Wear Inn`}</title>
        <meta name="description" content={`Review your shopping cart with ${itemCount || 0} items. Complete your purchase at Wear Inn.`} />
        <meta property="og:title" content={`Shopping Cart (${itemCount || 0} items) - Wear Inn`} />
        <meta property="og:description" content={`Review your shopping cart with ${itemCount || 0} items. Complete your purchase.`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/cart" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cart Items ({itemCount})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AnimatePresence mode="popLayout">
                      {items.map((item: CartItemType, index: number) => (
                        <div key={item.id} className={index !== items.length - 1 ? "border-b border-gray-200" : ""}>
                          <CartItem item={item} index={index} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <CartSummary />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};