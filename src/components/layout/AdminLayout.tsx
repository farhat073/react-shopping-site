import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/orders', label: 'Orders', icon: '📋' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
  ];

  return (
    <>
      <Helmet>
        <title>{title} - Admin - Wear Inn</title>
        <meta name="description" content="Admin panel for Wear Inn" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.first_name || user?.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
            <div className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              </div>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;