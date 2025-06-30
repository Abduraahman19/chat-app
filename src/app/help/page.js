'use client'

import { motion } from 'framer-motion';
import { FiHelpCircle, FiMail, FiUsers, FiBookOpen, FiArrowRight, FiPhone, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

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
            <FiHelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
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
              initial={{ y: 30 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white overflow-hidden shadow-xl rounded-2xl group transition-all duration-300"
            >
              <div className="p-8">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${resource.color} bg-opacity-20`}>
                  {resource.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{resource.name}</h3>
                <p className="text-gray-600 mb-6">{resource.description}</p>
                <Link
                  href={resource.href}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:underline transition-colors duration-300"
                >
                  {resource.name === "Contact Support" ? "Contact us" : "View resources"}
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2 text-blue-600">
                    <FiHelpCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                      {faq.category}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <p className="mt-2 text-gray-600">{faq.answer}</p>
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
              <p className="text-blue-100 max-w-2xl mx-auto mb-8">
                Our dedicated support team is available 24/7 to assist you with any questions or issues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300"
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${method.color} bg-opacity-20 mb-4`}>
                      {method.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">{method.name}</h3>
                    <p className="text-sky-600 text-sm mb-4">{method.description}</p>
                    <Link
                      href={method.href}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-300"
                    >
                      {method.buttonText}
                    </Link>
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