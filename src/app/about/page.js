'use client'
import { FiUsers, FiGlobe, FiHeart, FiAward, FiMessageSquare, FiCode, FiGlobe as FiNetwork } from 'react-icons/fi';
import { FaRegComments, FaHandshake, FaLightbulb } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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


const stats = [
  { id: 1, name: 'Active Users', value: '10,000+', icon: <FiUsers className="h-8 w-8" />, color: 'text-sky-300' },
  { id: 2, name: 'Countries', value: '150+', icon: <FiGlobe className="h-8 w-8" />, color: 'text-indigo-600' },
  { id: 3, name: 'Customer Satisfaction', value: '98%', icon: <FiHeart className="h-8 w-8" />, color: 'text-rose-500' },
  { id: 4, name: 'Awards Won', value: '12', icon: <FiAward className="h-8 w-8" />, color: 'text-amber-500' },
];

const teamMembers = [
  {
    name: 'Abdur Rahman',
    role: 'CEO & Founder',
    bio: 'Visionary leader with 15+ years in tech innovation',
    icon: <FaLightbulb className="h-6 w-6" />
  },
  {
    name: 'Sarah Chen',
    role: 'CTO',
    bio: 'Security expert and architecture specialist',
    icon: <FiCode className="h-6 w-6" />
  },
  {
    name: 'Miguel Rodriguez',
    role: 'Head of Design',
    bio: 'Creates intuitive user experiences',
    icon: <FiMessageSquare className="h-6 w-6" />
  },
  {
    name: 'Priya Patel',
    role: 'Global Partnerships',
    bio: 'Connects communities worldwide',
    icon: <FiNetwork className="h-6 w-6" />
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <Header />

      <main>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-48 bg-gradient-to-r from-sky-500 to-sky-700"
        >
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
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-lg"
              >
                <FaRegComments className="w-8 h-8 text-sky-600" />
              </motion.div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Our <span className="text-sky-200">Story</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-sky-100">
                Connecting people across the globe since 2018 with secure, intuitive communication solutions.
              </p>
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
                  <span className="inline-block bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Our Purpose
                  </span>
                  <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Redefining <span className="text-sky-600">Digital Communication</span>
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-lg text-gray-600"
                  >
                    We believe communication should be simple, secure, and accessible to everyone. Our mission is to break down barriers and bring people closer together through innovative technology that respects privacy and enhances human connection.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex flex-wrap gap-4"
                  >
                    <Link
                      href="#"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-tr hover:bg-gradient-to-bl from-sky-400 to-sky-700 hover:from-sky-400 hover:to-sky-700 hover:shadow-xl shadow-sm transition-all duration-300"
                    >
                      Join Our Community
                    </Link>
                    <Link
                      href="/features"
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md hover:shadow-xl shadow-sm text-sky-600 bg-white hover:bg-gray-50 transition-colors duration-300"
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
                  className="bg-gradient-to-br from-sky-100 to-indigo-100 p-8 rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <img
                      src="/assets/AI.png"
                      alt="Team collaborating"
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
          className="py-16 sm:py-24 lg:py-32 bg-sky-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block bg-white text-sky-600 px-3 py-1 rounded-full text-sm font-medium mb-4 shadow-sm">
                Our Team
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                The <span className="text-sky-600">People</span> Behind the Platform
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                A diverse team of engineers, designers, and visionaries spread across 12 countries.
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
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 bg-sky-100 p-3 rounded-lg text-sky-600">
                        {member.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-sky-600">{member.role}</p>
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
          className="py-16 sm:py-24 bg-gradient-to-r from-sky-500 to-sky-700"
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
                  <p className="mt-2 text-sm font-medium text-sky-100">{stat.name}</p>
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
              <span className="inline-block bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-medium mb-4 shadow-sm">
                Our Values
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What <span className="text-sky-600">Guides</span> Us
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
                <div className="flex justify-center text-sky-600 mb-4">
                  <FaHandshake className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Transparency</h3>
                <p className="text-gray-600">
                  We believe in open communication and building products that earn user trust through transparency.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="flex justify-center text-indigo-600 mb-4">
                  <FiUsers className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User-Centric Design</h3>
                <p className="text-gray-600">
                  Every decision starts with understanding and prioritizing our users' needs and experiences.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center text-amber-500 mb-4">
                  <FaLightbulb className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Innovation</h3>
                <p className="text-gray-600">
                  We embrace change and constantly seek better ways to solve communication challenges.
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