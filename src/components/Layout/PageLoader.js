'use client'
import { motion } from 'framer-motion'
import { FaRegComments } from 'react-icons/fa'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-purple-50 backdrop-blur-sm">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -15, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 25, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl"
        />
      </div>

      {/* Main Loader */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mb-8"
        >
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-transparent rounded-full border-t-indigo-500 border-r-purple-400 border-b-blue-600 border-l-indigo-300"
          />
          
          {/* Inner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-transparent rounded-full border-t-purple-500 border-r-indigo-400 border-b-purple-600 border-l-blue-300"
          />
          
          {/* Center Logo */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute flex items-center justify-center rounded-full inset-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 shadow-lg"
          >
            <FaRegComments className="w-6 h-6 text-white" />
            
            {/* Shine Effect */}
            <motion.div
              animate={{ x: [-20, 40] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
            ChatApp
          </motion.h2>
          
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="text-lg font-medium text-gray-600"
          >
            Loading...
          </motion.p>
          
          {/* Loading Dots */}
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}