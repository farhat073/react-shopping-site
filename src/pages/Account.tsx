import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const Account = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Account - Wear Inn</title>
        <meta name="description" content="Manage your account settings and profile information." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

            <div className="max-w-md">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">Profile updated successfully!</p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />

                  <Input
                    label="Role"
                    type="text"
                    value={user.role || 'user'}
                    disabled
                    className="bg-gray-50"
                  />

                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />

                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Account;