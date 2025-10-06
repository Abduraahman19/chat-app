'use client'
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
// Dynamically import icons
const FaRegComments = dynamic(() => import('react-icons/fa').then(mod => mod.FaRegComments));

const Footer = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-t border-indigo-200/50 backdrop-blur-sm relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -15, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-2 right-10 w-16 h-16 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 25, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-2 left-10 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Enhanced Logo Section */}
          <motion.div
            className="flex items-center space-x-3 mb-4 md:mb-0"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white/50"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <FaRegComments className="text-white text-lg" />
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-full"
              />
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              ChatApp
            </motion.span>
          </motion.div>

          {/* Enhanced Links Section */}
          <motion.div
            className="flex flex-wrap justify-center mb-4 md:mb-0 space-x-1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/contact', label: 'Contact Us' },
              { href: '/help', label: 'Help Center' }
            ].map((link, index) => (
              <motion.div key={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/80 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 border border-transparent hover:border-indigo-200/50 text-gray-600 hover:shadow-md backdrop-blur-sm"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Copyright Section */}
          <motion.div
            className="text-gray-500 text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent"
            >
              © {new Date().getFullYear()} ChatApp. All rights reserved.
            </motion.span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;