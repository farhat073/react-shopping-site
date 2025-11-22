import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, Truck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');
  const paymentMethod = searchParams.get('paymentMethod');

  const orderSteps = [
    { icon: CheckCircle, title: 'Order Confirmed', description: 'Your order has been placed successfully', completed: true },
    { icon: Package, title: 'Processing', description: 'We\'re preparing your items', completed: false },
    { icon: Truck, title: 'Shipped', description: 'Your order is on the way', completed: false },
    { icon: CheckCircle, title: 'Delivered', description: 'Package delivered to your address', completed: false }
  ];

  return (
    <>
      <Helmet>
        <title>Order Confirmed - Wear Inn</title>
        <meta name="description" content="Your order has been placed successfully. Track your order status and delivery." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-6"
            >
              <CheckCircle className="h-10 w-10" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Order Confirmed!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-lg text-gray-600"
            >
              Thank you for your purchase. We've sent a confirmation email with your order details.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="text-lg font-semibold text-gray-900">{orderId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${total || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      {index < orderSteps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Order Processing</h3>
                      <p className="text-sm text-gray-600">We'll start processing your order within 1-2 business days.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Shipping Updates</h3>
                      <p className="text-sm text-gray-600">You'll receive tracking information via email once shipped.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/orders" className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  View Order History
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/" className="flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;