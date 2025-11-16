import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice, getAssetUrl } from '../../utils/helpers';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
  index: number;
}

export const CartItem = ({ item, index }: CartItemProps) => {
  const { updateItemQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="hover:shadow-md transition-all hover:border-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.product.images && item.product.images.length > 0 ? getAssetUrl(item.product.images[0].id) : '/placeholder.jpg'}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {item.product.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {formatPrice(item.product.price)} each
              </p>
              <div className="text-base font-bold text-gray-900">
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                <Button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleQuantityChange(val);
                  }}
                  className="w-12 h-8 text-center border-0 focus-visible:ring-0 p-0"
                  min="1"
                />
                <Button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() => removeFromCart(item.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};