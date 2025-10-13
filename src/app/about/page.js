'use client'
import { FiUsers, FiGlobe, FiHeart, FiAward, FiMessageSquare, FiCode, FiGlobe as FiNetwork } from 'react-icons/fi';
import { FaRegComments, FaHandshake, FaLightbulb } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Image from 'next/image';
import { useState, useEffect } from 'react'
import PageLoader from '../../components/Layout/PageLoader'


const stats = [
  { id: 1, name: 'Real-time Features', value: '100%', icon: <FiUsers className="h-8 w-8" />, color: 'text-white' },
  { id: 2, name: 'Modern Tech Stack', value: 'Next.js', icon: <FiGlobe className="h-8 w-8" />, color: 'text-white' },
  { id: 3, name: 'Responsive Design', value: '100%', icon: <FiHeart className="h-8 w-8" />, color: 'text-white' },
  { id: 4, name: 'Firebase Powered', value: 'Yes', icon: <FiAward className="h-8 w-8" />, color: 'text-white' },
];

const teamMembers = [
  {
    name: 'Development Team',
    role: 'Full-Stack Development',
    bio: 'Built with Next.js, Firebase, and modern React patterns',
    icon: <FiCode className="h-6 w-6" />
  },
  {
    name: 'UI/UX Design',
    role: 'User Experience',
    bio: 'Crafted with Tailwind CSS and Framer Motion animations',
    icon: <FiMessageSquare className="h-6 w-6" />
  },
  {
    name: 'Backend Services',
    role: 'Real-time Infrastructure',
    bio: 'Firebase Firestore for real-time data synchronization',
    icon: <FaLightbulb className="h-6 w-6" />
  },
  {
    name: 'Media Storage',
    role: 'Cloud Integration',
    bio: 'Cloudinary for optimized media storage and delivery',
    icon: <FiNetwork className="h-6 w-6" />
  }
];

export default function About() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 850)
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

      <main className="relative z-10">
        {/* Enhanced Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative pt-20 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-56 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 overflow-hidden"
        >
          {/* Hero Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-2xl border-2 border-white/30 overflow-hidden"
              >
                {/* Icon Shine Effect */}
                <motion.div
                  animate={{ x: [-50, 100] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                <FaRegComments className="w-10 h-10 text-white relative z-10" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6"
              >
                Our <span className="text-indigo-200">Story</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 max-w-4xl mx-auto text-xl text-indigo-100 leading-relaxed"
              >
A modern chat application built with Next.js and Firebase, featuring real-time messaging, group chats, and secure media sharing for seamless communication.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-24 lg:py-32 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0">
                <motion.div
                  initial={{ x: -20 }}
                  whileInView={{ x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
                    Our Purpose
                  </span>
                  <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
                    Redefining <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Digital Communication</span>
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-lg text-gray-600"
                  >
                    We built this chat application to demonstrate modern web development capabilities with real-time features. Our focus is on creating intuitive user experiences with secure messaging, group management, and seamless media sharing powered by cutting-edge technologies.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex flex-wrap gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/signup"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Button Shine Effect */}
                        <motion.div
                          animate={{ x: [-100, 200] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                        <span className="relative z-10">Join Our Community</span>
                      </Link>
                    </motion.div>
                    
                    <Link
                      href="/features"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-lg font-bold rounded-xl hover:shadow-xl shadow-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300"
                    >
                      Explore Features
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
              <div className="lg:pl-8">
                <motion.div
                  initial={{ scale: 0.95 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm"
                >
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <Image
                      src="/assets/AI.png"
                      alt="Team collaborating"
                      width={800}  // Set actual dimensions
                      height={450}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 to-purple-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                Our Team
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6">
                The <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">People</span> Behind the Platform
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Built with modern web technologies and best practices for scalable real-time applications.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-white/50"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl text-indigo-600 shadow-sm">
                        {member.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm font-medium text-purple-600">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`flex justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="mt-2 text-4xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-indigo-100">{stat.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-24 lg:py-32 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                Our Values
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-8">
                What <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Guides</span> Us
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex justify-center text-indigo-600 mb-6"
                >
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-lg">
                    <FaHandshake className="h-8 w-8" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Transparency</h3>
                <p className="text-gray-600">
                  Built with secure Firebase authentication and real-time data synchronization for reliable messaging.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex justify-center text-purple-600 mb-6"
                >
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl shadow-lg">
                    <FiUsers className="h-8 w-8" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User-Centric Design</h3>
                <p className="text-gray-600">
                  Designed with intuitive interfaces, responsive layouts, and smooth animations for the best user experience.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex justify-center text-blue-600 mb-6"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
                    <FaLightbulb className="h-8 w-8" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Innovation</h3>
                <p className="text-gray-600">
                  Leveraging cutting-edge web technologies like Next.js 15, Firebase, and Cloudinary for optimal performance.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}