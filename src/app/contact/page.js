'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi'
import { FaWhatsapp, FaTelegram, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa'
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

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            setIsSubmitting(true)
            // Simulate form submission
            setTimeout(() => {
                console.log('Form submitted:', formData)
                setIsSubmitting(false)
                setSubmitSuccess(true)
                setFormData({ name: '', email: '', message: '' })
                setTimeout(() => setSubmitSuccess(false), 3000)
            }, 1500)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <Header />
            
            <main className="py-16 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-sky-400 to-sky-700 rounded-2xl mb-6 shadow-lg"
                    >
                        <FiMail className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-tr from-sky-400 to-sky-700">
                        Contact Us
                    </h1>
                    <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-600">
                        Have questions or feedback? We'd love to hear from you!
                    </p>
                </motion.div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>

                        {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
                            >
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Thank you! Your message has been sent successfully.
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl text-gray-700 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl text-gray-700 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 text-gray-700 rounded-xl border ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300`}
                                    placeholder="How can we help you?"
                                ></textarea>
                                {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
                            </div>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-tr from-sky-400 to-sky-700 hover:bg-gradient-to-bl hover:from-sky-400 hover:to-sky-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FiSend className="mr-2" />
                                        Send Message
                                    </span>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-8"
                    >
                        {/* Contact Cards */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                                >
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <FiMail size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                                        <p className="mt-1 text-gray-600 hover:text-blue-600 transition-colors duration-300">
                                            <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
                                        </p>
                                        <p className="mt-1 text-gray-600 hover:text-blue-600 transition-colors duration-300">
                                            <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                                >
                                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg text-green-600">
                                        <FiPhone size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Phone (Pakistan)</h3>
                                        <p className="mt-1 text-gray-700 hover:text-green-600 transition-colors duration-300">
                                            <a href="tel:+923117918605">+92 311 7918605</a>
                                        </p>
                                        <p className="mt-1 text-gray-700 hover:text-green-600 transition-colors duration-300">
                                            <a href="tel:+923126326009">+92 312 6326009</a>
                                        </p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <FiClock className="mr-1" />
                                            <span>Mon–Sat, 10:00 AM – 6:00 PM</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                                >
                                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg text-purple-600">
                                        <FiMapPin size={20} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Office Address</h3>
                                        <p className="mt-1 text-gray-700">Sitara Techno Park</p>
                                        <p className="mt-1 text-gray-700">Canal Road, Faisalabad</p>
                                        <p className="mt-1 text-gray-700">Postal Code: 18090</p>
                                        <p className="mt-1 text-gray-700">Punjab, Pakistan</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Google Map Embed */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Location</h2>
                            <div className="aspect-w-16 aspect-h-9 w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3407.072538374242!2d73.10186531510072!3d31.36534498142051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392267e3e4d6e7b9%3A0x8e2a6b4d5f4b5e5f!2sSitara%20Techni%20Park%2C%20Faisalabad!5e0!3m2!1sen!2s!4v1623251234567!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                            <div className="mt-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-300">
                                <FiMapPin className="text-red-500 mr-2" />
                                <a href="https://goo.gl/maps/example" target="_blank" rel="noopener noreferrer">
                                    View on Google Maps
                                </a>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Connect With Us</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                <motion.a
                                    href="https://wa.me/0123456789"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5 }}
                                    className="bg-green-100 p-4 rounded-xl text-green-600 hover:bg-green-200 transition-all duration-300 flex flex-col items-center"
                                >
                                    <FaWhatsapp size={24} />
                                    <span className="mt-2 text-sm">WhatsApp</span>
                                </motion.a>
                                <motion.a
                                    href="https://t.me/yourcompany"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5 }}
                                    className="bg-blue-100 p-4 rounded-xl text-blue-600 hover:bg-blue-200 transition-all duration-300 flex flex-col items-center"
                                >
                                    <FaTelegram size={24} />
                                    <span className="mt-2 text-sm">Telegram</span>
                                </motion.a>
                                <motion.a
                                    href="https://linkedin.com/company/yourcompany"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5 }}
                                    className="bg-blue-50 p-4 rounded-xl text-blue-700 hover:bg-blue-100 transition-all duration-300 flex flex-col items-center"
                                >
                                    <FaLinkedin size={24} />
                                    <span className="mt-2 text-sm">LinkedIn</span>
                                </motion.a>
                                <motion.a
                                    href="https://facebook.com/yourcompany"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5 }}
                                    className="bg-blue-100 p-4 rounded-xl text-blue-800 hover:bg-blue-200 transition-all duration-300 flex flex-col items-center"
                                >
                                    <FaFacebook size={24} />
                                    <span className="mt-2 text-sm">Facebook</span>
                                </motion.a>
                                <motion.a
                                    href="https://twitter.com/yourcompany"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -5 }}
                                    className="bg-blue-100 p-4 rounded-xl text-blue-400 hover:bg-blue-200 transition-all duration-300 flex flex-col items-center"
                                >
                                    <FaTwitter size={24} />
                                    <span className="mt-2 text-sm">Twitter</span>
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}