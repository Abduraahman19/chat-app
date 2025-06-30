import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sky-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Connect with your team <br className="hidden sm:block" /> in real-time
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10">
            Secure, fast, and reliable messaging platform for teams of all sizes. Collaborate effortlessly from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              href="/signup"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-base sm:text-lg shadow hover:shadow-lg transition"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-gray-50 font-medium text-base sm:text-lg shadow hover:shadow-lg transition"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
