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
  const [countdown, setCountdown] = useState(60);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Handle verification status
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const checkVerification = async () => {
      await user.reload();
      if (user.emailVerified) {
        setIsVerified(true);
        setTimeout(() => router.push('/chat'), 2000);
      }
    };

    // Check immediately
    if (user) checkVerification();

    // Check periodically
    const interval = setInterval(() => {
      if (user) checkVerification();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, loading, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle resend verification email
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await user.getIdToken(true); // Refresh token
      const result = await resendVerificationEmail();
      setCountdown(60);
      setMessage('Verification email resent! Check your inbox.');
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render verified state
  if (isVerified) {
    return <EmailVerifiedScreen />;
  }

  // Main verification page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Verification UI components */}
        <VerificationHeader />
        
        {message && <VerificationMessage message={message} />}
        
        <VerificationInstructions />
        
        <ResendButton 
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          countdown={countdown}
          isResending={isResending}
        />
        
        <SignOutButton onClick={() => signOut(auth).then(() => router.push('/login'))} />
      </motion.div>
    </div>
  );
}

// Sub-components for better organization
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <div className="animate-pulse flex justify-center mb-4">
        <div className="h-12 w-12 bg-blue-100 rounded-full"></div>
      </div>
      <p className="text-gray-600">Loading your account information...</p>
    </div>
  </div>
);

const EmailVerifiedScreen = () => (
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
          transition={{ duration: 2 }}
        />
      </div>
    </motion.div>
  </div>
);

const VerificationHeader = () => (
  <div className="flex justify-center mb-6">
    <div className="bg-blue-100 p-3 rounded-full">
      <FiMail className="h-8 w-8 text-blue-600" />
    </div>
  </div>
);

const VerificationMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`mb-6 p-3 rounded-lg text-center ${
      message.includes('resent') || message.includes('success')
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}
  >
    {message}
  </motion.div>
);

const VerificationInstructions = () => (
  <div className="bg-blue-50 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <FiClock className="text-blue-500 mr-2" />
      <span className="text-sm text-gray-700">
        Didn't receive the email? Check your spam folder or resend below.
      </span>
    </div>
  </div>
);

const ResendButton = ({ onClick, disabled, countdown, isResending }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center ${
      disabled
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
        : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg'
    } transition-all duration-300`}
  >
    {isResending ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      </span>
    ) : countdown > 0 ? (
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
);

const SignOutButton = ({ onClick }) => (
  <div className="mt-6 text-center">
    <button 
      onClick={onClick}
      className="flex items-center justify-center text-blue-600 hover:text-blue-800 mx-auto"
    >
      <FiLogOut className="mr-2" />
      Sign in with different account
    </button>
  </div>
);