import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import { CreditCard, Wallet, Building2, Info, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import { clearUserCart } from '../api/cart';
import { formatPrice, getAssetUrl } from '../utils/helpers';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import type { CartItem } from '../types';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculate order totals
  const subtotal = total;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!user) return;

    // Validate payment method selection
    if (!paymentMethod) {
      setError('Please select a payment method');
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create order with final total
      const orderId = await createOrder(user.id, finalTotal, items.map((item: CartItem) => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })));

      // Clear cart locally and remotely
      clearCart();
      await clearUserCart(user.id);

      toast.success('Order placed successfully!');
      // Redirect to payment success page with all order details
      navigate(`/payment-success?orderId=${orderId}&total=${finalTotal}&paymentMethod=${paymentMethod}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="text-center">
            <CardContent className="p-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
              <Button onClick={() => navigate('/')} variant="default">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Our Store</title>
        <meta name="description" content="Complete your purchase and review your order details." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment & Shipping */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment & Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                        {user?.first_name && user?.last_name && (
                          <p className="text-sm text-gray-600 mt-1">{user.first_name} {user.last_name}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor="card"
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              paymentMethod === 'card'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value="card" id="card" className="mr-3" />
                            <div className="flex items-center flex-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900">Credit/Debit Card</span>
                            </div>
                          </Label>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor="paypal"
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              paymentMethod === 'paypal'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value="paypal" id="paypal" className="mr-3" />
                            <div className="flex items-center flex-1">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <Wallet className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-900">PayPal</span>
                            </div>
                          </Label>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor="bank"
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              paymentMethod === 'bank'
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value="bank" id="bank" className="mr-3" />
                            <div className="flex items-center flex-1">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <Building2 className="h-5 w-5 text-green-600" />
                              </div>
                              <span className="font-medium text-gray-900">Bank Transfer</span>
                            </div>
                          </Label>
                        </motion.div>
                      </RadioGroup>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Payment Processing</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Payment processing will be implemented in the next step. For now, this will create an order record.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          Shipping address collection will be implemented in the next step.
                        </p>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {items.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={item.product.images && item.product.images.length > 0 ? getAssetUrl(item.product.images[0].id) : '/placeholder.jpg'}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.product.title}</h3>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({items.length} items)</span>
                        <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900 font-medium">
                          {shipping === 0 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Free
                            </Badge>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900 font-medium">{formatPrice(tax)}</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    {subtotal < 50 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                      >
                        <p className="text-sm text-blue-800 text-center">
                          Add <span className="font-semibold">{formatPrice(50 - subtotal)}</span> more for free shipping!
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
