'use client'

import { motion } from 'framer-motion';
import { FiHelpCircle, FiMail, FiUsers, FiBookOpen, FiArrowRight, FiPhone, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';
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

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click 'Forgot Password'. You'll receive an email with instructions to reset your password.",
    category: "Account"
  },
  {
    question: "Is there a mobile app available?",
    answer: "Yes! Our app is available for both iOS and Android devices. You can download it from the respective app stores.",
    category: "Mobile"
  },
  {
    question: "How secure is my data?",
    answer: "We use end-to-end encryption to protect all your messages and data. Your privacy is our top priority.",
    category: "Security"
  },
  {
    question: "Can I use ChatApp for business?",
    answer: "Absolutely! We offer business plans with additional features tailored for professional use.",
    category: "Business"
  },
  {
    question: "How do I create a group chat?",
    answer: "Click the 'New Chat' button and select 'New Group'. Then add participants and customize your group settings.",
    category: "Features"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for premium plans.",
    category: "Billing"
  }
];

const resources = [
  {
    name: "Documentation",
    description: "Detailed guides and API references",
    icon: <FiBookOpen className="h-6 w-6" />,
    href: "#",
    color: "text-blue-600"
  },
  {
    name: "Community Forum",
    description: "Connect with other users",
    icon: <FiUsers className="h-6 w-6" />,
    href: "#",
    color: "text-purple-600"
  },
  {
    name: "Contact Support",
    description: "Get direct help from our team",
    icon: <FiMail className="h-6 w-6" />,
    href: "contact",
    color: "text-emerald-600"
  }
];

const contactMethods = [
  {
    name: "Email Support",
    description: "Typically responds within 2 hours",
    icon: <FiMail className="h-8 w-8" />,
    href: "mailto:abdurrahmanasim0303@gmail.com",
    buttonText: "Send Email",
    color: "bg-blue-100 text-blue-600"
  },
  {
    name: "Live Chat",
    description: "Available 24/7 for instant help",
    icon: <FiMessageCircle className="h-8 w-8" />,
    href: "#",
    buttonText: "Start Chat",
    color: "bg-purple-100 text-purple-600"
  },
  {
    name: "Phone Support",
    description: "Mon-Fri, 9am-5pm (EST)",
    icon: <FiPhone className="h-8 w-8" />,
    href: "tel:+923117918605",
    buttonText: "Call Now",
    color: "bg-emerald-100 text-emerald-600"
  }
];

export default function HelpCenter() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-purple-50">
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-blue-600 rounded-2xl mb-6 shadow-lg"
          >
            <FiHelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
            Help Center
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-600">
            Find answers to common questions or contact our support team
          </p>
        </motion.div>

        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3 mb-20"
        >
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, scale: 0.95 }}
              whileInView={{ y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl group transition-all duration-500 border border-white/50 relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${resource.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="p-8 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${resource.color} bg-gradient-to-br ${resource.bgColor} shadow-lg border-2 border-white/50`}
                >
                  {resource.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                  {resource.name}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>
                
                <motion.div whileHover={{ x: 5 }}>
                  <Link
                    href={resource.href}
                    className={`inline-flex items-center text-sm font-medium ${resource.color} hover:text-purple-600 group-hover:underline transition-colors duration-300`}
                  >
                    {resource.name === "Contact Support" ? "Contact us" : "View resources"}
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-7xl mx-auto mb-20"
        >
          <div className="text-center mb-16">
            <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
              FAQ
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
              Frequently Asked <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              Find quick answers to the most common questions about our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-start relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-3 text-indigo-600 shadow-sm"
                  >
                    <FiHelpCircle className="h-5 w-5" />
                  </motion.div>
                  
                  <div className="ml-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 mb-3 shadow-sm">
                      {faq.category}
                    </span>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                      {faq.question}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
            
            <div className="text-center relative z-10">
              <motion.h2 
                whileHover={{ scale: 1.05 }}
                className="text-4xl font-bold text-white mb-6"
              >
                Still need help?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-indigo-100 max-w-3xl mx-auto mb-10 text-lg leading-relaxed"
              >
                Our dedicated support team is available 24/7 to assist you with any questions or issues you may have.
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 border border-white/20 group"
                  >
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 ${method.color} mb-6 shadow-lg border border-white/30`}
                    >
                      {method.icon}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-100 transition-colors duration-300">
                      {method.name}
                    </h3>
                    
                    <p className="text-indigo-200 text-sm mb-6 leading-relaxed">{method.description}</p>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={method.href}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300 relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ x: [-50, 100] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                        <span className="relative z-10">{method.buttonText}</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}