'use client'
import { motion } from 'framer-motion'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import { FiShield, FiDatabase, FiMail, FiKey, FiUser } from 'react-icons/fi'

export default function PrivacyPage() {
  const privacyPoints = [
    {
      icon: <FiUser className="w-5 h-5" />,
      title: "Information We Collect",
      items: [
        "Personal Data: Name, email, contact details when you register",
        "Usage Data: How you interact with our services (IP, browser, pages visited)",
        "Cookies: To improve user experience (you can disable them in browser settings)"
      ]
    },
    {
      icon: <FiDatabase className="w-5 h-5" />,
      title: "How We Use Data",
      items: [
        "Provide and maintain our services",
        "Improve user experience",
        "Send important notices (security updates, policy changes)",
        "Prevent fraud and abuse"
      ]
    },
    {
      icon: <FiShield className="w-5 h-5" />,
      title: "Data Sharing",
      description: "We do not sell your data. Limited sharing may occur with:",
      items: [
        "Service providers (hosting, analytics)",
        "Legal compliance (court orders, law enforcement)"
      ]
    },
    {
      icon: <FiKey className="w-5 h-5" />,
      title: "Your Rights",
      items: [
        "Access, update, or delete your information",
        "Opt-out of marketing communications",
        "Request data portability"
      ]
    },
    {
      icon: <FiMail className="w-5 h-5" />,
      title: "Security Measures",
      description: "We implement encryption (SSL), regular security audits, and access controls to protect your data."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />
      
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6"
            >
              <FiShield className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-4xl font-extrabold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              Privacy Policy
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {privacyPoints.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
                    {section.icon}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">{section.title}</h2>
                    {section.description && (
                      <p className="text-gray-600 mb-3">{section.description}</p>
                    )}
                    {section.items && (
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start text-gray-600">
                            <span className="flex-shrink-0 mt-1 mr-2 text-blue-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-blue-50 rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Questions About Our Privacy Policy?</h3>
            <p className="text-gray-600 mb-4">
              Contact us at <a href="mailto:privacy@yourcompany.com" className="text-blue-600 hover:underline">privacy@yourcompany.com</a>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}