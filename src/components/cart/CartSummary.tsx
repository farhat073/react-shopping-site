import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Truck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

export const CartSummary = () => {
  const { total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + shipping + tax;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items ({itemCount})</span>
              <span className="text-gray-900 font-medium">{formatPrice(total)}</span>
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

          {total < 50 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2"
            >
              <Truck className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Add <span className="font-semibold">{formatPrice(50 - total)}</span> more for free shipping!
              </p>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            onClick={() => navigate('/checkout')}
            className="w-full"
            size="lg"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            onClick={clearCart}
            variant="outline"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};