'use client'

import { FaRegComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiStar, FiAward, FiZap, FiUsers, FiDatabase, FiHeadphones } from 'react-icons/fi';
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

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individuals and small teams",
    features: [
      { text: "Up to 5 team members", icon: <FiUsers className="text-sky-500" /> },
      { text: "Basic messaging features", icon: <FaRegComments className="text-sky-500" /> },
      { text: "1GB file storage", icon: <FiDatabase className="text-sky-500" /> },
      { text: "Email support", icon: <FiHeadphones className="text-sky-500" /> }
    ],
    featured: false,
    color: "from-sky-100 to-sky-50",
    button: "bg-sky-600 hover:bg-sky-700"
  },
  {
    name: "Professional",
    price: "$14.99",
    description: "For growing businesses and teams",
    features: [
      { text: "Up to 50 team members", icon: <FiUsers className="text-indigo-500" /> },
      { text: "Advanced messaging features", icon: <FaRegComments className="text-indigo-500" /> },
      { text: "50GB file storage", icon: <FiDatabase className="text-indigo-500" /> },
      { text: "Priority email & chat support", icon: <FiHeadphones className="text-indigo-500" /> },
      { text: "Custom integrations", icon: <FiZap className="text-indigo-500" /> }
    ],
    featured: true,
    color: "from-indigo-100 to-indigo-50",
    button: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      { text: "Unlimited team members", icon: <FiUsers className="text-purple-500" /> },
      { text: "All premium features", icon: <FiAward className="text-purple-500" /> },
      { text: "Custom storage solutions", icon: <FiDatabase className="text-purple-500" /> },
      { text: "24/7 dedicated support", icon: <FiHeadphones className="text-purple-500" /> },
      { text: "Advanced security", icon: <FiZap className="text-purple-500" /> },
      { text: "Custom integrations", icon: <FiZap className="text-purple-500" /> }
    ],
    featured: false,
    color: "from-purple-100 to-purple-50",
    button: "bg-purple-600 hover:bg-purple-700"
  }
];

const PricingCard = ({ plan, index }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -10 }}
      className={`relative h-full flex flex-col rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${plan.featured ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {/* Ribbon for featured plan */}
      {plan.featured && (
        <div className="absolute -top-1.5 right-2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 transform rotate-45 translate-x-8 translate-y-4 z-10">
          POPULAR
        </div>
      )}

      {/* Plan header */}
      <div className={`bg-gradient-to-r ${plan.color} p-8 text-center`}>
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-4 flex justify-center items-baseline">
          <span className="text-5xl font-extrabold text-gray-900">
            {plan.price}
          </span>
          {plan.price !== "Free" && plan.price !== "Custom" && (
            <span className="ml-2 text-lg font-medium text-gray-500">
              /month
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600">{plan.description}</p>
      </div>

      {/* Plan features */}
      <div className="flex-1 bg-white p-8 flex flex-col">
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              whileHover={{ x: 5 }}
              className="flex items-start"
            >
              <span className="flex-shrink-0 mt-1 mr-3">{feature.icon}</span>
              <span className="text-gray-700">{feature.text}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA button */}
        <div className="mt-auto pt-4">
          <Link
            href="#"
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm ${plan.button} transition-colors duration-200`}
          >
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
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-gray-50">
      <Header />

      <main className="py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-sky-400 to-sky-700 rounded-full mb-6 shadow-lg"
          >
            <FiStar className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Simple, <span className="bg-gradient-to-tr from-sky-400 to-sky-700 bg-clip-text text-transparent">Transparent</span> Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-5 max-w-3xl mx-auto text-xl text-gray-600"
          >
            Choose the perfect plan for your team. Scale up or down as needed.
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

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl p-8 text-center border border-gray-200"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need something more?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Our enterprise solutions offer custom features, unlimited scalability, and dedicated support for large organizations.
            </p>
            <div className="flex justify-center">
              <Link
                href="#"
                className="px-8 py-3 bg-gradient-to-tr from-sky-400 to-sky-700 text-white rounded-lg font-medium hover:bg-gradient-to-bl hover:from-sky-400 hover:to-sky-700 transition-all duration-300 flex items-center"
              >
                <FiHeadphones className="mr-2" />
                Contact Our Sales Team
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}