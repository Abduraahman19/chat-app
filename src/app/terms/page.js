'use client'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiAlertTriangle, FiLock, FiEdit2, FiRefreshCw } from 'react-icons/fi'
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

export default function TermsPage() {
  const termsSections = [
    {
      icon: <FiCheckCircle className="w-5 h-5" />,
      title: "Acceptance of Terms",
      content: "By accessing or using our services, you agree to comply with these Terms. If you disagree, please refrain from using our platform."
    },
    {
      icon: <FiAlertTriangle className="w-5 h-5" />,
      title: "User Responsibilities",
      items: [
        "You must be at least 13 years old to use our services",
        "Do not share false, harmful, or illegal content",
        "Respect other users' privacy and rights",
        "Maintain the confidentiality of your account credentials"
      ]
    },
    {
      icon: <FiLock className="w-5 h-5" />,
      title: "Intellectual Property",
      content: "All content on this platform (logos, text, graphics) is our property or licensed to us. Unauthorized use is prohibited."
    },
    {
      icon: <FiEdit2 className="w-5 h-5" />,
      title: "Content Guidelines",
      items: [
        "You retain ownership of content you create",
        "You grant us a license to display and distribute your content",
        "Prohibited content includes hate speech, harassment, and illegal material"
      ]
    },
    {
      icon: <FiRefreshCw className="w-5 h-5" />,
      title: "Changes to Terms",
      content: "We may update these Terms periodically. Continued use after changes constitutes acceptance. We'll notify you of significant changes."
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
              className="inline-flex items-center justify-center w-16 h-16 bg-sky-200 rounded-2xl mb-6"
            >
              <FiCheckCircle className="w-8 h-8 text-sky-700" />
            </motion.div>
            <h1 className="text-4xl font-extrabold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-700">
              Terms of Service
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {termsSections.map((section, index) => (
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
                    {section.content && (
                      <p className="text-gray-600">{section.content}</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help Understanding Our Terms?</h3>
            <p className="text-gray-600">
              Contact our legal team at <a href="mailto:legal@yourcompany.com" className="text-sky-600 hover:underline">legal@yourcompany.com</a>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}