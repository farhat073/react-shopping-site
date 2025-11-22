import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { CreditCard, Wallet, Building2, Info, Loader2, ShoppingBag, Truck, MapPin, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../api/orders';
import { clearUserCart } from '../api/cart';
import { formatPrice, getAssetUrl } from '../utils/helpers';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import type { CartItem } from '../types';
import type { Address } from '../types/order';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Form data
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Calculate order totals
  const subtotal = total;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Billing', icon: MapPin },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Review', icon: CheckCircle }
  ];

  const validateAddress = (address: Address): string[] => {
    const errors: string[] = [];
    if (!address.first_name.trim()) errors.push('First name is required');
    if (!address.last_name.trim()) errors.push('Last name is required');
    if (!address.email.trim()) errors.push('Email is required');
    if (!address.address_line_1.trim()) errors.push('Address line 1 is required');
    if (!address.city.trim()) errors.push('City is required');
    if (!address.state.trim()) errors.push('State is required');
    if (!address.postal_code.trim()) errors.push('Postal code is required');
    if (!address.country.trim()) errors.push('Country is required');
    return errors;
  };

  const handleNext = () => {
    setError(null);

    if (currentStep === 1) {
      const errors = validateAddress(shippingAddress);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
    } else if (currentStep === 2) {
      const addressToValidate = sameAsShipping ? shippingAddress : billingAddress;
      const errors = validateAddress(addressToValidate);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
    } else if (currentStep === 3) {
      if (!paymentMethod) {
        setError('Please select a payment method');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleCheckout = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const finalBillingAddress = sameAsShipping ? shippingAddress : billingAddress;

      // Create order with all details
      const orderData = {
        user_id: user.id,
        total_price: finalTotal,
        shipping_address: shippingAddress,
        billing_address: finalBillingAddress,
        items: items.map((item: CartItem) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id,
          quantity: item.quantity,
          price: item.product.price + (item.variant?.price_modifier || 0)
        }))
      };

      const order = await createOrder(orderData);

      // Clear cart locally and remotely
      clearCart();
      await clearUserCart(user.id);

      toast.success('Order placed successfully!');
      // Redirect to payment success page with order details
      navigate(`/payment-success?orderId=${order.id}&total=${finalTotal}&paymentMethod=${paymentMethod}`);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-first-name">First Name</Label>
                  <Input
                    id="shipping-first-name"
                    value={shippingAddress.first_name}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-last-name">Last Name</Label>
                  <Input
                    id="shipping-last-name"
                    value={shippingAddress.last_name}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="shipping-email">Email</Label>
                <Input
                  id="shipping-email"
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="shipping-phone">Phone (Optional)</Label>
                <Input
                  id="shipping-phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="shipping-address-1">Address Line 1</Label>
                <Input
                  id="shipping-address-1"
                  value={shippingAddress.address_line_1}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="shipping-address-2">Address Line 2 (Optional)</Label>
                <Input
                  id="shipping-address-2"
                  value={shippingAddress.address_line_2}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shipping-city">City</Label>
                  <Input
                    id="shipping-city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-state">State</Label>
                  <Input
                    id="shipping-state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-postal">Postal Code</Label>
                  <Input
                    id="shipping-postal"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="10001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="shipping-country">Country</Label>
                <Input
                  id="shipping-country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="US"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="same-as-shipping"
                  checked={sameAsShipping}
                  onChange={(e) => {
                    setSameAsShipping(e.target.checked);
                    if (e.target.checked) {
                      setBillingAddress(shippingAddress);
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor="same-as-shipping">Same as shipping address</Label>
              </div>

              {!sameAsShipping && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-first-name">First Name</Label>
                      <Input
                        id="billing-first-name"
                        value={billingAddress.first_name}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-last-name">Last Name</Label>
                      <Input
                        id="billing-last-name"
                        value={billingAddress.last_name}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billing-email">Email</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing-phone">Phone (Optional)</Label>
                    <Input
                      id="billing-phone"
                      value={billingAddress.phone}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing-address-1">Address Line 1</Label>
                    <Input
                      id="billing-address-1"
                      value={billingAddress.address_line_1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing-address-2">Address Line 2 (Optional)</Label>
                    <Input
                      id="billing-address-2"
                      value={billingAddress.address_line_2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billing-city">City</Label>
                      <Input
                        id="billing-city"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-state">State</Label>
                      <Input
                        id="billing-state"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-postal">Postal Code</Label>
                      <Input
                        id="billing-postal"
                        value={billingAddress.postal_code}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billing-country">Country</Label>
                    <Input
                      id="billing-country"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="US"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Label
                    htmlFor="card"
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Label
                    htmlFor="paypal"
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'paypal' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Label
                    htmlFor="bank"
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'bank' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
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
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
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
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                    <p>{shippingAddress.address_line_1}</p>
                    {shippingAddress.address_line_2 && <p>{shippingAddress.address_line_2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                    <p>{shippingAddress.country}</p>
                    <p className="mt-2">{shippingAddress.email}</p>
                    {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Billing Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p>{sameAsShipping ? shippingAddress.first_name : billingAddress.first_name} {sameAsShipping ? shippingAddress.last_name : billingAddress.last_name}</p>
                    <p>{sameAsShipping ? shippingAddress.address_line_1 : billingAddress.address_line_1}</p>
                    {(sameAsShipping ? shippingAddress.address_line_2 : billingAddress.address_line_2) && <p>{sameAsShipping ? shippingAddress.address_line_2 : billingAddress.address_line_2}</p>}
                    <p>{sameAsShipping ? shippingAddress.city : billingAddress.city}, {sameAsShipping ? shippingAddress.state : billingAddress.state} {sameAsShipping ? shippingAddress.postal_code : billingAddress.postal_code}</p>
                    <p>{sameAsShipping ? shippingAddress.country : billingAddress.country}</p>
                    <p className="mt-2">{sameAsShipping ? shippingAddress.email : billingAddress.email}</p>
                    {(sameAsShipping ? shippingAddress.phone : billingAddress.phone) && <p>{sameAsShipping ? shippingAddress.phone : billingAddress.phone}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="capitalize">{paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - Wear Inn</title>
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

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-gray-900' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Content */}
              <div className="space-y-6">
                {renderStepContent()}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button onClick={handleNext} className="flex items-center gap-2">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          Place Order
                          <CheckCircle className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
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
                              {formatPrice((item.product.price + (item.variant?.price_modifier || 0)) * item.quantity)}
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
