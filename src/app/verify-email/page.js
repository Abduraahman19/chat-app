'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const { user, loading, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);
  const [message, setMessage] = useState('');

  // Check verification status every 5 seconds
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.emailVerified) {
      router.push('/chat');
      return;
    }

    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        router.push('/chat');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Resend email countdown
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
      setMessage('Verification email resent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="mb-4">
          We've sent a verification email to <span className="font-semibold">{user?.email}</span>.
          Please check your inbox and verify your email address.
        </p>
        
        {message && (
          <div className={`mb-4 p-2 rounded ${message.includes('resent') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={countdown > 0}
          className={`w-full py-2 px-4 rounded ${countdown > 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
        </button>

        <div className="mt-4 text-center">
          <button 
            onClick={() => signOut(auth).then(() => router.push('/login'))}
            className="text-blue-500 hover:text-blue-700"
          >
            Sign in with different account
          </button>
        </div>
      </div>
    </div>
  );
}