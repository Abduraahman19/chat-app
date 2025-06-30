'use client'

import { motion } from 'framer-motion';
import { FiMessageSquare, FiUsers, FiLock, FiGlobe, FiBell, FiCheck, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

const features = [
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Real-time Messaging",
    description: "Chat instantly with your team with our lightning-fast messaging system.",
    gradient: "from-blue-500 to-blue-400"
  },
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: "Group Chats",
    description: "Create unlimited groups for projects, teams, or social circles.",
    gradient: "from-purple-500 to-purple-400"
  },
  {
    icon: <FiLock className="w-6 h-6" />,
    title: "End-to-End Encryption",
    description: "Your conversations are secured with military-grade encryption.",
    gradient: "from-emerald-500 to-emerald-400"
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: "Multi-Platform",
    description: "Access from any device - desktop, mobile, or tablet.",
    gradient: "from-amber-500 to-amber-400"
  },
  {
    icon: <FiBell className="w-6 h-6" />,
    title: "Smart Notifications",
    description: "Customize alerts to stay updated without distractions.",
    gradient: "from-rose-500 to-rose-400"
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: "Message Read Receipts",
    description: "Know when your messages have been seen by recipients.",
    gradient: "from-indigo-500 to-indigo-400"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />
      
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg"
          >
            <FiMessageSquare className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Powerful Features
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-600">
            Everything you need for seamless communication, designed to enhance your productivity
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl mb-6 bg-gradient-to-r ${feature.gradient} text-white shadow-md`}>
                {feature.icon}
              </div>
              <h3 className="relative z-10 text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="relative z-10 text-gray-600">{feature.description}</p>
              <div className="relative z-10 mt-6 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                <span className="text-sm font-medium">Learn more</span>
                <FiArrowRight className="ml-2 h-4 w-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-0.5 shadow-lg">
            <Link
              href="/signup"
              className="block px-8 py-4 bg-white rounded-xl hover:bg-transparent group transition-all duration-300"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 group-hover:text-white text-lg font-semibold">
                Get Started Free
              </span>
            </Link>
          </div>
          <p className="mt-4 text-gray-500">
            No credit card required. Start your 14-day free trial.
          </p>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}