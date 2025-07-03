'use client'

import { motion } from 'framer-motion';
import { FiMessageSquare, FiUsers, FiLock, FiGlobe, FiBell, FiCheck, FiArrowRight, FiCloud, FiVideo, FiFileText } from 'react-icons/fi';
import Link from 'next/link';
import dynamic from 'next/dynamic'

// Dynamically import components that might cause HMR issues
const Header = dynamic(() => import('@/components/Layout/Header'), {
  ssr: false,
  loading: () => <div className="h-[62px] bg-sky-50"></div>
})

const Footer = dynamic(() => import('@/components/Layout/Footer'), {
  ssr: false,
  loading: () => null
})

const features = [
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Real-time Messaging",
    description: "Chat instantly with your team with our lightning-fast messaging system.",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: "Group Chats",
    description: "Create unlimited groups for projects, teams, or social circles.",
    gradient: "from-purple-400 to-purple-600"
  },
  {
    icon: <FiLock className="w-6 h-6" />,
    title: "End-to-End Encryption",
    description: "Your conversations are secured with military-grade encryption.",
    gradient: "from-emerald-400 to-emerald-600"
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: "Multi-Platform",
    description: "Access from any device - desktop, mobile, or tablet.",
    gradient: "from-amber-400 to-amber-600"
  },
  {
    icon: <FiBell className="w-6 h-6" />,
    title: "Smart Notifications",
    description: "Customize alerts to stay updated without distractions.",
    gradient: "from-rose-400 to-rose-600"
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: "Message Read Receipts",
    description: "Know when your messages have been seen by recipients.",
    gradient: "from-indigo-400 to-indigo-600"
  },
  {
    icon: <FiCloud className="w-6 h-6" />,
    title: "Cloud Sync",
    description: "Access your conversations from any device with seamless cloud synchronization.",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    icon: <FiVideo className="w-6 h-6" />,
    title: "HD Video Calls",
    description: "Crystal clear video calls with friends and family, no matter where they are.",
    gradient: "from-purple-400 to-purple-600"
  },
  {
    icon: <FiFileText className="w-6 h-6" />,
    title: "File Sharing",
    description: "Share documents, photos and videos up to 2GB with anyone in your network.",
    gradient: "from-amber-400 to-amber-600"
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-sky-400 to-sky-700 rounded-2xl mb-6 shadow-lg"
          >
            <FiMessageSquare className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-tr from-sky-400 to-sky-700">
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
              <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl mb-6 bg-gradient-to-tr ${feature.gradient} text-white shadow-md`}>
                {feature.icon}
              </div>
              <h3 className="relative z-10 text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="relative z-10 text-gray-600">{feature.description}</p>
              <div className="relative z-10 mt-6 flex items-center text-sky-600 group-hover:text-sky-700 transition-colors duration-300">
                <Link href="#" className="flex items-center">
                  <span className="text-sm font-medium">Learn more</span>
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
          <div className="flex justify-center"> {/* Added flex container for centering */}
            <div className="bg-gradient-to-tr from-sky-400 to-sky-700 rounded-2xl p-0.5 shadow-lg w-fit mx-auto"> {/* Added w-fit and mx-auto */}
              <Link
                href="#"
                className="block px-6 py-3 bg-white rounded-xl hover:bg-transparent group transition-all duration-300"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-tr from-sky-400 to-sky-700 group-hover:text-white text-lg font-semibold">
                  Get Started Free
                </span>
              </Link>
            </div>
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