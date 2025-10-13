'use client'

import { FaRegComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiStar, FiAward, FiZap, FiUsers, FiDatabase, FiHeadphones } from 'react-icons/fi';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { useState, useEffect } from 'react'
import PageLoader from '../../components/Layout/PageLoader'

const plans = [
  {
    name: "Free Demo",
    price: "Free",
    description: "Experience all features with no limitations",
    features: [
      { text: "Unlimited messaging", icon: <FaRegComments className="text-indigo-500" /> },
      { text: "Group chat creation", icon: <FiUsers className="text-indigo-500" /> },
      { text: "Media sharing (photos/videos)", icon: <FiDatabase className="text-indigo-500" /> },
      { text: "Real-time notifications", icon: <FiHeadphones className="text-indigo-500" /> }
    ],
    featured: true,
    color: "from-indigo-100 to-indigo-50",
    button: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
  },
  {
    name: "Personal",
    price: "$4.99",
    description: "Enhanced features for personal use",
    features: [
      { text: "All free features", icon: <FiAward className="text-purple-500" /> },
      { text: "Custom profile themes", icon: <FaRegComments className="text-purple-500" /> },
      { text: "Advanced search filters", icon: <FiDatabase className="text-purple-500" /> },
      { text: "Priority support", icon: <FiHeadphones className="text-purple-500" /> },
      { text: "Message backup", icon: <FiZap className="text-purple-500" /> }
    ],
    featured: false,
    color: "from-purple-100 to-purple-50",
    button: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
  },
  {
    name: "Business",
    price: "$9.99",
    description: "Perfect for teams and organizations",
    features: [
      { text: "All personal features", icon: <FiAward className="text-blue-500" /> },
      { text: "Admin dashboard", icon: <FiUsers className="text-blue-500" /> },
      { text: "Team analytics", icon: <FiDatabase className="text-blue-500" /> },
      { text: "24/7 support", icon: <FiHeadphones className="text-blue-500" /> },
      { text: "Custom integrations", icon: <FiZap className="text-blue-500" /> },
      { text: "Advanced security", icon: <FiZap className="text-blue-500" /> }
    ],
    featured: false,
    color: "from-blue-100 to-blue-50",
    button: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
  }
];

const PricingCard = ({ plan, index }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 300 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className={`relative h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-sm border border-white/50 ${
        plan.featured ? 'ring-4 ring-purple-500/50 shadow-purple-500/25' : ''
      }`}
    >
      {/* Enhanced Ribbon */}
      {plan.featured && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="absolute -top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-6 py-2 transform translate-x-8 translate-y-4 z-20 shadow-lg"
        >
          POPULAR
        </motion.div>
      )}

      {/* Enhanced Plan header */}
      <div className={`bg-gradient-to-br ${plan.color} p-8 text-center relative overflow-hidden`}>
        {/* Shine Effect */}
        <motion.div
          animate={{ x: [-100, 200] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
        
        <motion.h3 
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold text-gray-900 relative z-10"
        >
          {plan.name}
        </motion.h3>
        
        <div className="mt-6 flex justify-center items-baseline relative z-10">
          <motion.span 
            whileHover={{ scale: 1.1 }}
            className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            {plan.price}
          </motion.span>
          {plan.price !== "Free" && plan.price !== "Custom" && (
            <span className="ml-2 text-lg font-medium text-gray-500">
              /month
            </span>
          )}
        </div>
        
        <p className="mt-3 text-gray-600 relative z-10 leading-relaxed">{plan.description}</p>
      </div>

      {/* Enhanced Plan features */}
      <div className="flex-1 bg-white/90 backdrop-blur-sm p-8 flex flex-col relative">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 pointer-events-none" />
        
        <ul className="space-y-5 mb-8 relative z-10">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ x: 8, scale: 1.02 }}
              className="flex items-start group"
            >
              <motion.span 
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 mt-1 mr-4 p-1 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow"
              >
                {feature.icon}
              </motion.span>
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                {feature.text}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Enhanced CTA button */}
        <div className="mt-auto pt-6 relative z-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={plan.price === "Free" ? "/signup" : "#"}
              className={`w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-2xl text-white shadow-xl ${plan.button} transition-all duration-300 relative overflow-hidden`}
            >
              {/* Button Shine Effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              
              <span className="relative z-10 flex items-center">
                {plan.price === "Free" ? (
                  <>
                    <FiStar className="mr-2" />
                    Get Started
                  </>
                ) : plan.price === "Custom" ? (
                  <>
                    <FiHeadphones className="mr-2" />
                    Contact Sales
                  </>
                ) : (
                  <>
                    <FiZap className="mr-2" />
                    Upgrade Now
                  </>
                )}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Pricing() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 900)
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
        {/* Enhanced Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-full mb-8 shadow-2xl border-4 border-white/50 overflow-hidden"
          >
            {/* Shine Effect */}
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            <FiStar className="w-10 h-10 text-white relative z-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-7xl mb-6"
          >
            Simple, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Transparent</span> Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-4xl mx-auto text-xl text-gray-600 leading-relaxed"
          >
            Start with our free demo to experience all features, then upgrade for enhanced capabilities and premium support.
          </motion.p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 lg:gap-6"
        >
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </motion.div>

        {/* Enhanced Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-10 text-center border border-white/50 shadow-2xl backdrop-blur-sm relative overflow-hidden"
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/30 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.h3 
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Need something more?
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              Our enterprise solutions offer custom features, unlimited scalability, and dedicated support for large organizations.
            </motion.p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Button Shine Effect */}
                <motion.div
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                
                <span className="relative z-10 flex items-center text-lg">
                  <FiHeadphones className="mr-3" />
                  Contact Our Sales Team
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}