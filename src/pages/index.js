import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';
import { motion } from 'framer-motion';
import { FaRegComments } from 'react-icons/fa';
import { FiArrowRight, FiMessageSquare, FiUsers, FiShield } from 'react-icons/fi';
import PageLoader from '../components/Layout/PageLoader';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading || user || !mounted) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-50 via-white to-purple-50 relative overflow-hidden">
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
      <main className="flex-grow flex items-center justify-center px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Hero Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-full mb-8 shadow-2xl border-4 border-white/50 overflow-hidden"
          >
            <motion.div
              animate={{ x: [-100, 200] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
            <FaRegComments className="w-12 h-12 text-white relative z-10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Connect with your team <br className="hidden sm:block" /> in real-time
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Secure, fast, and reliable messaging platform for teams of all sizes. Collaborate effortlessly from anywhere in the world.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: [-50, 100] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <span className="relative z-10 flex items-center">
                  Get Started for Free
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-200 text-lg font-bold rounded-xl hover:shadow-xl shadow-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-300"
              >
                Try Demo
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
