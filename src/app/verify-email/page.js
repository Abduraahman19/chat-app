'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { FiMail, FiClock, FiLogOut, FiCheckCircle } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const { user, loading, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user?.emailVerified) {
      setIsVerified(true);
      setTimeout(() => router.push('/chat'), 3000);
      return;
    }

    const interval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setIsVerified(true);
          clearInterval(interval);
          setTimeout(() => router.push('/chat'), 3000);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, loading, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      setCountdown(30);
      setMessage('Verification email resent! Check your inbox.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="animate-pulse flex justify-center mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading your account information...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting you to the app...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <FiMail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Email</h1>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification email to <span className="font-semibold text-blue-600">{user?.email}</span>.
        </p>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-lg text-center ${
              message.includes('resent') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FiClock className="text-blue-500 mr-2" />
            <span className="text-sm text-gray-700">
              Didn't receive the email? Check your spam folder or resend below.
            </span>
          </div>
        </div>

        <motion.button
          onClick={handleResend}
          disabled={countdown > 0}
          whileHover={countdown > 0 ? {} : { scale: 1.02 }}
          whileTap={countdown > 0 ? {} : { scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center ${
            countdown > 0 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg'
          } transition-all duration-300`}
        >
          {countdown > 0 ? (
            <>
              <FiClock className="mr-2" />
              Resend in {countdown}s
            </>
          ) : (
            <>
              <FiMail className="mr-2" />
              Resend Verification Email
            </>
          )}
        </motion.button>

        <div className="mt-6 text-center">
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center text-blue-600 hover:text-blue-800 mx-auto"
          >
            <FiLogOut className="mr-2" />
            Sign in with different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}