import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Profile() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Display Name</label>
          <p className="text-gray-900">{user?.displayName || 'Not set'}</p>
        </div>
        <button
          onClick={logOut}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}