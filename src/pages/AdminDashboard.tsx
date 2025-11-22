import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { Card } from '../components/ui/card';
import { Badge } from '../components/common/Badge';
import { formatPrice } from '../utils/helpers';
import { getAdminDashboardMetrics, getAdminRecentOrders, getAdminLowStockProducts } from '../api/admin';
import type { Order, Product } from '../types';

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: number;
  ordersByStatus: Record<string, number>;
}

type AdminOrder = Order & { user: { first_name?: string; last_name?: string } };

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsData, ordersData, lowStockData] = await Promise.all([
          getAdminDashboardMetrics(),
          getAdminRecentOrders(5),
          getAdminLowStockProducts()
        ]);

        setMetrics(metricsData);
        setRecentOrders(ordersData);
        setLowStockProducts(lowStockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
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
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalOrders || 0}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(metrics?.totalRevenue || 0, 'USD')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🛍️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalProducts || 0}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalUsers || 0}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Order Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics?.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="text-center">
                  <Badge variant={getStatusVariant(status)} className="mb-2">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link
                  to="/admin/orders"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.first_name} {order.user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total_price, 'USD')}
                      </p>
                      <Badge variant={getStatusVariant(order.status)} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                <Link
                  to="/admin/products"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt_text || product.title}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={product.stock === 0 ? 'error' : 'warning'}>
                        {product.stock} left
                      </Badge>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">All products are well stocked</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;