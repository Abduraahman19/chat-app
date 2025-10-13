'use client'
import { motion } from 'framer-motion'
import { FiShield, FiDatabase, FiMail, FiKey, FiUser, FiArrowRight } from 'react-icons/fi'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import PageLoader from '../../components/Layout/PageLoader'

// Dynamically import components that might cause HMR issues
const Header = dynamic(() => import('@/components/Layout/Header'), { 
  ssr: false,
  loading: () => <div className="h-[62px] bg-gradient-to-r from-indigo-50 via-white to-purple-50"></div>
})

const Footer = dynamic(() => import('@/components/Layout/Footer'), {
  ssr: false,
  loading: () => null
})

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 700)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <PageLoader />
  }

  const privacyPoints = [
    {
      icon: <FiUser className="w-5 h-5" />,
      title: "Information We Collect",
      items: [
        "Account Data: Email, display name, profile photo when you register",
        "Messages: Chat messages, media files, and group conversations",
        "Usage Data: Login times, device information, and app interactions",
        "Media Files: Photos, videos, and documents shared through our platform"
      ]
    },
    {
      icon: <FiDatabase className="w-5 h-5" />,
      title: "How We Use Your Data",
      items: [
        "Enable real-time messaging and group chat functionality",
        "Store and deliver your messages and media files",
        "Maintain your contact list and group memberships",
        "Provide message status indicators (sent, delivered, read)",
        "Enable search functionality within your conversations"
      ]
    },
    {
      icon: <FiShield className="w-5 h-5" />,
      title: "Data Storage & Sharing",
      description: "Your data is stored securely using Firebase and Cloudinary services:",
      items: [
        "Firebase Firestore: Stores messages, user profiles, and chat data",
        "Cloudinary: Stores and optimizes your photos and media files",
        "We do not sell or share your personal data with third parties",
        "Data may be shared only for legal compliance when required"
      ]
    },
    {
      icon: <FiKey className="w-5 h-5" />,
      title: "Your Privacy Rights",
      items: [
        "Update your profile information and display name anytime",
        "Delete your messages (for yourself or everyone in the chat)",
        "Leave group chats and remove your data from them",
        "Delete your account and all associated data",
        "Control who can add you to groups and send you messages"
      ]
    },
    {
      icon: <FiMail className="w-5 h-5" />,
      title: "Security & Protection",
      description: "We protect your data with industry-standard security measures:",
      items: [
        "Firebase Authentication for secure login and account protection",
        "HTTPS encryption for all data transmission",
        "Secure cloud storage with access controls and monitoring",
        "Regular security updates and vulnerability assessments"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -15, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 25, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl"
        />
      </div>
      <Header />
      
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-blue-600 rounded-2xl mb-6 shadow-lg relative"
            >
              <FiShield className="w-10 h-10 text-white" />
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-2xl"
              />
            </motion.div>
            <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
              Privacy Policy
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
            {privacyPoints.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className={`p-8 transition-all duration-300 group relative overflow-hidden ${index % 2 === 0 ? 'bg-white/80' : 'bg-gradient-to-br from-indigo-50/50 via-white/50 to-purple-50/50'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl text-indigo-600 shadow-lg border border-white/50 relative z-10"
                  >
                    {section.icon}
                  </motion.div>
                  <div className="ml-6 relative z-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{section.title}</h2>
                    {section.description && (
                      <p className="text-gray-600 mb-3">{section.description}</p>
                    )}
                    {section.items && (
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <motion.li 
                            key={itemIndex} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                            className="flex items-start text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                          >
                            <motion.span 
                              whileHover={{ scale: 1.5, rotate: 180 }}
                              className="flex-shrink-0 mt-1 mr-3 text-indigo-500 font-bold"
                            >
                              •
                            </motion.span>
                            <span className="leading-relaxed">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
            
            <div className="relative z-10">
              <motion.h3 
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold text-white mb-4"
              >
                Questions About Our Privacy Policy?
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-indigo-100 mb-6 text-lg leading-relaxed"
              >
                Have questions about how we handle your messages, media files, or account data? We're here to help.
              </motion.p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2"
              >
                <a 
                  href="mailto:abdurrahmanasim0303@gmail.com" 
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    animate={{ x: [-50, 100] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                  <FiMail className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Contact Privacy Team</span>
                  <motion.div
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="relative z-10"
                  >
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </motion.div>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}