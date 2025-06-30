// src/components/Footer.js
import { FaRegComments } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-sky-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-3 mb-6 md:mb-0"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center shadow-md"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <FaRegComments className="text-white text-lg" />
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-tr from-sky-500 to-sky-700 bg-clip-text text-transparent"
              whileHover={{ scale: 1.03 }}
            >
              ChatApp
            </motion.span>
          </motion.div>

          {/* Links Section */}
          <motion.div
            className="flex flex-wrap justify-center mb-6 md:mb-0"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/privacy"
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
              Privacy Policy
            </Link>
            <Link href="/terms"
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
              Terms of Service
            </Link>
            <Link href="/contact"
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
              Contact Us
            </Link>
            <Link href="/help"
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
              Help Center
            </Link>
          </motion.div>

          {/* Copyright Section */}
          <motion.div
            className="text-gray-500 text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            © {new Date().getFullYear()} ChatApp. All rights reserved.
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;