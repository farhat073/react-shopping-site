import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { getOrders } from '../api/orders';
import { formatPrice } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import type { Order } from '../types';

interface OrderWithItems extends Order {
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      title: string;
      slug: string;
      images?: Array<{
        url: string;
        alt_text?: string;
        is_primary: boolean;
      }>;
    };
    variant?: {
      id: string;
      name: string;
      value: string;
      price_modifier: number;
    };
  }>;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const userOrders = await getOrders(user.id);
        setOrders(userOrders as OrderWithItems[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order History - Wear Inn</title>
        <meta name="description" content="View your order history and track your purchases." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <a href="/" className="btn-primary">
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order?.id != null ? String(order.id).slice(-8) : 'unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          {formatPrice(order.total_price, 'USD')}
                        </p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                           <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                             <div className="flex items-center space-x-3">
                               {item.product?.images?.find((img) => img.is_primary)?.url && (
                                 <img
                                   src={item.product.images.find((img) => img.is_primary)!.url}
                                   alt={item.product.title}
                                   className="w-12 h-12 object-cover rounded-md"
                                 />
                               )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.product?.title}</p>
                                {item.variant && (
                                  <p className="text-xs text-gray-600">{item.variant.name}: {item.variant.value}</p>
                                )}
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity, 'USD')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;