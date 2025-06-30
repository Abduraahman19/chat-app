'use client'
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUsernameFromEmail } from '../../utils/helpers';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiUser, FiLogIn, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import { FaRegComments } from 'react-icons/fa';

export default function Header() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Handle scroll effect with debounce
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 10);
      }, 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const avatarContent = user?.email ? user.email.charAt(0).toUpperCase() : '';

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-sky-50 backdrop-blur-md shadow-sm py-0' : 'bg-sky-50 backdrop-blur-sm py-1'
          }`}
      >
        <div className="max-w-8xl border-b border-gray-200 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo with animation */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <FaRegComments className="text-white text-sm" />
                </motion.div>
                <motion.span
                  className="text-xl font-bold bg-gradient-to-tr from-sky-500 to-sky-700 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.03 }}
                >
                  ChatApp
                </motion.span>
              </Link>
            </motion.div>

            <div className="hidden md:flex">
              <Link
                href="/features"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
                Features
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
                Pricing
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
                About
              </Link>
              <Link
                href="/help"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:bg-sky-200 active:text-sky-800 border border-transparent hover:border-sky-200 text-gray-600 hover:shadow-sm">
                Help
              </Link>
            </div>
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="relative"
                    ref={menuRef}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center cursor-pointer space-x-2 focus:outline-none"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center text-white font-medium shadow-md"
                        animate={isMenuOpen ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ type: 'spring' }}
                      >
                        {avatarContent}
                      </motion.div>
                      <motion.span
                        className="hidden md:inline text-sm font-medium text-gray-700"
                        whileHover={{ color: '#3B82F6' }}
                      >
                        {user.displayName || getUsernameFromEmail(user.email)}
                      </motion.span>
                    </motion.button>

                    {/* Dropdown Menu with animation */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100 overflow-hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.05 }}
                          >
                            <Link
                              href="/profile"
                              className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center transition-colors duration-150"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiUser className="mr-3 text-blue-500" />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              href="/chats"
                              className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center transition-colors duration-150"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiMessageSquare className="mr-3 text-blue-500" />
                              <span>My Chats</span>
                            </Link>
                            <Link
                              href="/settings"
                              className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center transition-colors duration-150"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiSettings className="mr-3 text-blue-500" />
                              <span>Settings</span>
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <motion.button
                              onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-100/60 flex items-center transition-colors duration-150"
                              whileHover={{ x: 2 }}
                            >
                              <FiLogOut className="mr-3 text-blue-500" />
                              <span>Sign out</span>
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-md transition-all"
                  >
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center"
                    >
                      <FiLogIn className="w-4 h-4 mr-2" />
                      Sign in
                    </motion.span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Add padding to main content to prevent overlap */}
      <div className="h-[62px] bg-sky-50"></div>
    </>
  );
}