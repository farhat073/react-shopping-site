import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

export const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Our Store</title>
        <meta name="description" content="Learn about Our Store's mission, values, and commitment to providing high-quality products and exceptional shopping experiences." />
        <meta property="og:title" content="About Us - Our Store" />
        <meta property="og:description" content="Learn about our mission, values, and commitment to quality products and customer satisfaction." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/about" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Our Store",
            "description": "We're passionate about providing high-quality products and exceptional shopping experiences.",
            "url": window.location.origin,
            "logo": `${window.location.origin}/logo.png`
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're passionate about providing high-quality products and exceptional shopping experiences.
            </p>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To offer a curated selection of premium products that enhance our customers' lives,
                while providing outstanding service and value.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quality First</h2>
              <p className="text-gray-600 mb-6">
                Every product in our store is carefully selected for its quality, design, and functionality.
                We believe in building lasting relationships with our customers through trust and excellence.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• Customer satisfaction is our top priority</li>
                <li>• Sustainable and ethical sourcing</li>
                <li>• Innovation in product selection</li>
                <li>• Transparent pricing and policies</li>
                <li>• Community engagement and support</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600">
                Have questions or feedback? We'd love to hear from you.
                Reach out to our customer service team for assistance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};