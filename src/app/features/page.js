'use client'

import { motion } from 'framer-motion';
import { FiMessageSquare, FiUsers, FiLock, FiGlobe, FiBell, FiCheck, FiArrowRight, FiCloud, FiVideo, FiFileText } from 'react-icons/fi';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { useState, useEffect } from 'react'
import PageLoader from '../../components/Layout/PageLoader'

const features = [
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Real-time Messaging",
    description: "Instant messaging with typing indicators and message status tracking.",
    gradient: "from-indigo-500 to-purple-600"
  },
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: "Group Chats",
    description: "Create groups with admin controls, member management, and group photos.",
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    icon: <FiLock className="w-6 h-6" />,
    title: "Secure Authentication",
    description: "Firebase-powered secure login with profile management and privacy controls.",
    gradient: "from-indigo-600 to-blue-600"
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: "Multi-Platform",
    description: "Responsive design works seamlessly on desktop, mobile, and tablet devices.",
    gradient: "from-purple-600 to-pink-600"
  },
  {
    icon: <FiBell className="w-6 h-6" />,
    title: "Unread Counters",
    description: "Track unread messages with real-time counters and notification badges.",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: "Message Status",
    description: "See when messages are sent, delivered, and read with status indicators.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: <FiCloud className="w-6 h-6" />,
    title: "Media Sharing",
    description: "Share photos, videos, and files with Cloudinary-powered media storage.",
    gradient: "from-purple-500 to-blue-600"
  },
  {
    icon: <FiVideo className="w-6 h-6" />,
    title: "Camera Integration",
    description: "Capture and share photos directly from your device camera.",
    gradient: "from-indigo-600 to-purple-600"
  },
  {
    icon: <FiFileText className="w-6 h-6" />,
    title: "Message Search",
    description: "Find any message quickly with powerful search and message forwarding.",
    gradient: "from-blue-600 to-indigo-600"
  }
];

export default function Features() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 750)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"
        />
      </div>

      <Header />

      <main className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-3xl mb-8 shadow-2xl border-4 border-white/50 overflow-hidden"
          >
            {/* Shine Effect */}
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            <FiMessageSquare className="w-12 h-12 text-white relative z-10" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold sm:text-6xl sm:tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 mb-6"
          >
            Powerful Features
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-4xl mx-auto text-xl text-gray-600 leading-relaxed"
          >
Experience real-time messaging with group chats, media sharing, and secure authentication - all built with modern web technologies
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ y: -15, scale: 1.03, rotateY: 5 }}
              className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 8 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
              />
              
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-br ${feature.gradient} text-white shadow-lg border-2 border-white/30 overflow-hidden`}>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  {feature.icon}
                </motion.div>
              </div>
              
              <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="relative z-10 text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="relative z-10 flex items-center text-indigo-600 group-hover:text-purple-600 transition-colors duration-300"
              >
                <Link href="#" className="flex items-center font-medium">
                  <span className="text-sm">Learn more</span>
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-24 text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 rounded-2xl p-1 shadow-2xl relative overflow-hidden">
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              
              <Link
                href="/signup"
                className="relative block px-8 py-4 bg-white rounded-xl hover:bg-transparent group transition-all duration-300 border border-white/20 shadow-lg"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 group-hover:text-white text-lg font-bold relative z-10">
                  Get Started Free
                </span>
              </Link>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-gray-500 text-lg"
          >
            No credit card required. Start your 14-day free trial.
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}