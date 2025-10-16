'use client'
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUsernameFromEmail } from '../../utils/helpers';
import { useRouter } from 'next/navigation';
import ProfilePicture from '../ProfilePicture';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

// Dynamically import icons
const FiLogOut = dynamic(() => import('react-icons/fi').then(mod => mod.FiLogOut));
const FiUser = dynamic(() => import('react-icons/fi').then(mod => mod.FiUser));
const FiLogIn = dynamic(() => import('react-icons/fi').then(mod => mod.FiLogIn));
const FiMessageSquare = dynamic(() => import('react-icons/fi').then(mod => mod.FiMessageSquare));
const FiSettings = dynamic(() => import('react-icons/fi').then(mod => mod.FiSettings));
const FaRegComments = dynamic(() => import('react-icons/fa').then(mod => mod.FaRegComments));
const FiUserPlus = dynamic(() => import('react-icons/fi').then(mod => mod.FiUserPlus));

export default function Header() {
  const { user, logOut, totalUnreadCount } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Handle click outside menu
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, mounted]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    router.push(user ? '/chat' : '/');
  };

  if (!mounted) {
    return <div className="h-[68px] bg-gradient-to-r from-indigo-50/30 via-white/30 to-purple-50/30"></div>;
  }

  return (
    <>
      {/* Animated Background Elements */}
      <div className="fixed top-0 w-full h-20 overflow-hidden pointer-events-none z-40">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-2 right-10 w-16 h-16 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -60, 0],
            y: [0, 15, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1 left-20 w-12 h-12 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl"
        />
      </div>

      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', type: "spring", stiffness: 100 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 py-0' : 'bg-gradient-to-r from-indigo-50/80 via-white/80 to-purple-50/80 backdrop-blur-xl border-b border-white/30 py-1'}`}
      >
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 relative">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-transparent to-purple-50/30 pointer-events-none" />
          
          <div className="flex justify-between items-center h-16 relative z-10">
            {/* Enhanced Logo */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Link
                href={user ? '/chat' : '/'}
                className="flex items-center space-x-3 group"
                onClick={handleLogoClick}
              >
                <div className="relative">
                  {/* Animated Ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-30 blur-sm"
                  />
                  
                  <motion.div
                    className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-white/50"
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <FaRegComments className="text-white text-lg" />
                    
                    {/* Shine Effect */}
                    <motion.div
                      animate={{ x: [-20, 40] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-full"
                    />
                  </motion.div>
                </div>
                
                <motion.div className="flex flex-col">
                  <motion.span
                    className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-blue-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    ChatApp
                  </motion.span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                    className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </motion.div>
              </Link>
            </motion.div>

            {/* Enhanced Navigation */}
            <motion.div 
              className="hidden md:flex items-center space-x-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
            >
              {[
                { href: '/features', label: 'Features' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/about', label: 'About Us' },
                { href: '/help', label: 'Help Center' }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="group relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-all duration-300"
                  >
                    <motion.span
                      whileHover={{ y: -1 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                    
                    {/* Hover Background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-indigo-100/50"
                      whileHover={{ scale: 1.05 }}
                    />
                    
                    {/* Bottom Border Animation */}
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced User Navigation */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="relative"
                    ref={menuRef}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <motion.button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="group flex items-center cursor-pointer space-x-3 focus:outline-none p-2 rounded-xl hover:bg-white/50 transition-all duration-300 border border-transparent hover:border-white/30 backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative">
                        <ProfilePicture 
                          user={user} 
                          size="lg" 
                          showOnlineStatus={true}
                          isOnline={true}
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                        />
                        {/* Unread Count Badge */}
                        {totalUnreadCount > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white"
                          >
                            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                          </motion.div>
                        )}
                      </div>
                      
                      <motion.div className="hidden md:flex flex-col items-start">
                        <motion.span
                          className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300"
                          whileHover={{ x: 2 }}
                        >
                          {user.displayName || getUsernameFromEmail(user.email)}
                        </motion.span>
                        <motion.span
                          className="text-xs text-gray-500 group-hover:text-indigo-500 transition-colors duration-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          Online
                        </motion.span>
                      </motion.div>
                      
                      {/* Dropdown Arrow */}
                      <motion.div
                        animate={{ rotate: isMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden md:block text-gray-400 group-hover:text-indigo-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </motion.button>

                    {/* Enhanced Dropdown Menu */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: 'easeOut', type: "spring", stiffness: 300 }}
                          className="absolute right-0 mt-4 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/50 overflow-hidden"
                          style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)'
                          }}
                        >
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 pointer-events-none" />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="relative z-10 py-2"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Link
                                href="/profile"
                                className="group px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 flex items-center transition-all duration-300 relative overflow-hidden"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ rotate: 360, scale: 1.2 }}
                                  transition={{ duration: 0.5 }}
                                  className="mr-4 p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white shadow-lg"
                                >
                                  <FiUser size={16} />
                                </motion.div>
                                <span className="font-semibold group-hover:text-indigo-600 transition-colors text-base">My Profile</span>
                                <motion.div
                                  className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  whileHover={{ x: 2 }}
                                >
                                  →
                                </motion.div>
                              </Link>
                            </motion.div>
                            <div className='hidden'>
                              <motion.button
                                onClick={() => router.push('/add-contact')}
                                className="md:hidden p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Add Contact"
                              >
                                <FiUserPlus className="w-5 h-5" />
                              </motion.button>

                              {/* Add Contact Button - Desktop (Full button) */}
                              <motion.button
                                onClick={() => router.push('/add-contact')}
                                className="hidden md:flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FiUserPlus className="w-4 h-4" />
                                <span>Add Contact</span>
                              </motion.button>
                            </div>
                            <div className="border-t border-gray-100/50 my-2 mx-4"></div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <motion.button
                                onClick={handleLogout}
                                className="group w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center transition-all duration-300 relative overflow-hidden"
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <motion.div
                                  whileHover={{ rotate: 360, scale: 1.2 }}
                                  transition={{ duration: 0.5 }}
                                  className="mr-4 p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg text-white shadow-lg"
                                >
                                  <FiLogOut size={16} />
                                </motion.div>
                                <span className="font-semibold group-hover:text-red-600 transition-colors text-base">Sign out</span>
                                <motion.div
                                  className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  whileHover={{ x: 2 }}
                                >
                                  →
                                </motion.div>
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  <Link
                    href="/login"
                    className="group relative flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white text-sm font-semibold hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden"
                  >
                    {/* Shine Effect */}
                    <motion.div
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                    
                    <motion.span
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center relative z-10"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FiLogIn className="w-4 h-4 mr-2" />
                      </motion.div>
                      Sign in
                    </motion.span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Spacer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="h-[68px] bg-gradient-to-r from-indigo-50 via-white to-purple-50"
      />
    </>
  );
}