'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiEdit, FiMail, FiChevronLeft, FiSave, FiX, FiUser, FiLock, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

export default function Profile() {
  const { user, loading, logOut, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    status: '',
    photoURL: '',
    email: '',
    lastLogin: '',
    accountCreated: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        setFormData({
          displayName: user?.displayName || '',
          status: userDoc.exists() ? userDoc.data().status || "Hey there! I'm using ChatApp" : "Hey there! I'm using ChatApp",
          photoURL: user?.photoURL || '',
          email: user?.email || '',
          lastLogin: userDoc.exists() ? formatDate(userDoc.data().lastLogin) : 'Recently',
          accountCreated: userDoc.exists() ? formatDate(userDoc.data().createdAt) : formatDate(new Date())
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserData();
  }, [user, router]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpdateProfile = async () => {
    setSaving(true); // 👈 Add this
    try {
      if (!user) return;

      await updateUserProfile({
        displayName: formData.displayName,
        status: formData.status,
        photoURL: formData.photoURL || user?.photoURL || ''
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        position: 'bottom-center',
        style: {
          background: '#4BB543',
          color: '#fff',
        }
      });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile', {
        position: 'bottom-center',
        style: {
          background: '#FF3333',
          color: '#fff',
        }
      });
    } finally {
      setSaving(false); // 👈 Add this
    }
  };


  const handleLogout = async () => {
    setLoggingOut(true); // 👈 Add this
    try {
      await logOut();
      router.push('/');
      toast.success('Logged out successfully', {
        position: 'bottom-center',
        style: {
          background: '#4BB543',
          color: '#fff',
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed', {
        position: 'bottom-center',
        style: {
          background: '#FF3333',
          color: '#fff',
        }
      });
    } finally {
      setLoggingOut(false); // 👈 Add this
    }
  };


  if (loading || !user) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 border-b-blue-600 border-l-blue-300 animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="mt-4 text-gray-600 font-medium"
        >
          Loading your profile...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-gray-50">
      <Header />

      {/* Back button and title */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-transparent pt-2 pb-4">
        <div className="max-w-md mx-auto px-4 relative flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200/50 text-gray-600 transition duration-200 z-10 flex items-center"
          >
            <FiChevronLeft size={20} />
            <span className="ml-1">Back</span>
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2"
          >
            Profile Settings
          </motion.h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mt-4 mb-8"
        >
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center"
            >
              <span className="text-white text-4xl font-bold">
                {formData.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200"
              >
                <FiEdit className="text-blue-600" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Personal Information Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-blue-500" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-gray-800 border-b border-blue-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.displayName || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                {isEditing ? (
                  <textarea
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-gray-800 border-b border-blue-400 focus:outline-none focus:border-blue-500 resize-none"
                    rows={2}
                    placeholder="What's on your mind?"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiLock className="mr-2 text-blue-500" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <div className="mt-1 flex items-center">
                  <FiMail className="text-gray-400 mr-2" />
                  <p className="text-gray-800">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</label>
                  <p className="mt-1 text-gray-800">{formData.lastLogin}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</label>
                  <p className="mt-1 text-gray-800">{formData.accountCreated}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiGlobe className="mr-2 text-blue-500" />
              Preferences
            </h2>
            <p className="text-gray-500">Coming soon - language, theme, and notification preferences</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <FiX className="mr-2" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateProfile}
                disabled={saving}
                className={`py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-md ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <FiEdit className="mr-2" />
              Edit Profile
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={loggingOut}
            className={`w-full py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg font-medium hover:from-red-500 hover:to-red-600 transition-all duration-300 flex items-center justify-center shadow-md ${loggingOut ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loggingOut ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging out...
              </span>
            ) : (
              <>
                <FiLogOut className="mr-2" />
                Logout
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}