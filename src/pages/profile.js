'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiEdit, FiMail, FiChevronLeft, FiSave, FiX, FiUser, FiLock, FiGlobe, FiCamera, FiShield, FiSettings, FiStar } from 'react-icons/fi';
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
    setLoggingOut(true);
    try {
      await logOut();
      // Force full page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm">
        <div className="relative w-24 h-24">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-transparent rounded-full border-t-indigo-500 border-r-purple-400 border-b-blue-600 border-l-cyan-300"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute flex items-center justify-center rounded-full shadow-2xl inset-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600"
          >
            <motion.div 
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 bg-white rounded-full"
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg font-semibold text-gray-700"
          >
            Loading your profile...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-1 max-w-xs mx-auto mt-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full top-10 left-10 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 rounded-full bottom-20 right-20 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-indigo-100/20 blur-3xl"
        />
      </div>
      
      <Header />

      {/* Enhanced Header with Glassmorphism */}
      <div className="sticky top-0 z-20 border-b shadow-lg backdrop-blur-xl bg-white/70 border-white/20">
        <div className="relative flex items-center justify-between max-w-md px-6 py-4 mx-auto">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center p-3 text-gray-700 transition-all duration-300 border shadow-lg group rounded-xl bg-white/80 hover:bg-white hover:shadow-xl border-white/50"
          >
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FiChevronLeft size={18} />
            </motion.div>
            <span className="ml-2 font-medium transition-colors group-hover:text-indigo-600">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute transform -translate-x-1/2 left-1/2"
          >
            <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text">
              Profile Settings
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-md px-4 pb-20 mx-auto">
        {/* Enhanced Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="relative flex flex-col items-center mt-8 mb-12"
        >
          <div className="relative group">
            {/* Animated Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute rounded-full -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-20 blur-lg"
            />
            
            {/* Profile Picture Container */}
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative flex items-center justify-center overflow-hidden transition-all duration-500 border-4 border-white rounded-full shadow-2xl w-36 h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 group-hover:shadow-3xl"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5)'
              }}
            >
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="text-5xl font-bold text-white drop-shadow-lg"
              >
                {formData.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </motion.span>
              
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>
            
            {/* Status Indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
              className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-white rounded-full shadow-lg bottom-2 right-2 border-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
            
            {/* Edit Button */}
            {isEditing && (
              <motion.button
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="absolute p-3 text-white transition-all duration-300 border-2 border-white rounded-full shadow-xl -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-2xl"
              >
                <FiCamera size={16} />
              </motion.button>
            )}
          </div>
          
          {/* User Name with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-center"
          >
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
              {formData.displayName || 'Welcome User'}
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-1 font-medium text-gray-500"
            >
              {formData.email}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Enhanced Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden border shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl border-white/50"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50" />
          {/* Personal Information Section */}
          <div className="relative p-8 border-b border-gray-100/50">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center mb-6 text-xl font-bold text-gray-800 group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="p-2 mr-3 text-white rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500"
              >
                <FiUser size={18} />
              </motion.div>
              <span className="text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                Personal Information
              </span>
            </motion.h2>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <label className="flex items-center mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">
                  <FiUser className="mr-2 text-indigo-500" size={14} />
                  Display Name
                </label>
                {isEditing ? (
                  <motion.input
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 text-gray-800 transition-all duration-300 border-2 border-gray-200 shadow-sm bg-gray-50/50 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                    placeholder="Enter your name"
                  />
                ) : (
                  <motion.p 
                    whileHover={{ x: 5 }}
                    className="px-4 py-3 font-medium text-gray-800 transition-all duration-300 border border-gray-100 bg-gray-50/30 rounded-xl group-hover:bg-gray-50/50"
                  >
                    {formData.displayName || 'Not set'}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <label className="flex items-center mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">
                  <FiStar className="mr-2 text-indigo-500" size={14} />
                  Status Message
                </label>
                {isEditing ? (
                  <motion.textarea
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    whileFocus={{ scale: 1.02 }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 text-gray-800 transition-all duration-300 border-2 border-gray-200 shadow-sm resize-none bg-gray-50/50 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                    rows={3}
                    placeholder="What's on your mind?"
                  />
                ) : (
                  <motion.p 
                    whileHover={{ x: 5 }}
                    className="px-4 py-3 text-gray-800 bg-gray-50/30 rounded-xl font-medium border border-gray-100 group-hover:bg-gray-50/50 transition-all duration-300 min-h-[3rem] flex items-center"
                  >
                    {formData.status}
                  </motion.p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="relative p-8 border-b border-gray-100/50">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center mb-6 text-xl font-bold text-gray-800 group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="p-2 mr-3 text-white rounded-lg shadow-lg bg-gradient-to-br from-green-500 to-emerald-500"
              >
                <FiShield size={18} />
              </motion.div>
              <span className="text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                Account Information
              </span>
            </motion.h2>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="group"
              >
                <label className="flex items-center mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">
                  <FiMail className="mr-2 text-green-500" size={14} />
                  Email Address
                </label>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center px-4 py-3 transition-all duration-300 border border-gray-100 bg-gray-50/30 rounded-xl group-hover:bg-gray-50/50"
                >
                  <FiMail className="mr-3 text-gray-400" size={18} />
                  <p className="font-medium text-gray-800">{formData.email}</p>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="group"
                >
                  <label className="flex items-center mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="w-3 h-3 mr-2 bg-green-500 rounded-full animate-pulse" />
                    Last Login
                  </label>
                  <motion.p 
                    whileHover={{ x: 5 }}
                    className="px-4 py-3 font-medium text-gray-800 transition-all duration-300 border border-gray-100 bg-gray-50/30 rounded-xl group-hover:bg-gray-50/50"
                  >
                    {formData.lastLogin}
                  </motion.p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="group"
                >
                  <label className="flex items-center mb-2 text-sm font-semibold tracking-wider text-gray-600 uppercase">
                    <div className="w-3 h-3 mr-2 bg-indigo-500 rounded-full" />
                    Member Since
                  </label>
                  <motion.p 
                    whileHover={{ x: 5 }}
                    className="px-4 py-3 font-medium text-gray-800 transition-all duration-300 border border-gray-100 bg-gray-50/30 rounded-xl group-hover:bg-gray-50/50"
                  >
                    {formData.accountCreated}
                  </motion.p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="relative p-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-center mb-6 text-xl font-bold text-gray-800 group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="p-2 mr-3 text-white rounded-lg shadow-lg bg-gradient-to-br from-purple-500 to-pink-500"
              >
                <FiSettings size={18} />
              </motion.div>
              <span className="text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                Preferences
              </span>
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="p-6 border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                >
                  <FiGlobe className="text-white" size={20} />
                </motion.div>
              </div>
              <p className="font-medium text-center text-gray-600">
                🚀 Coming Soon - Advanced preferences for language, theme, and notifications
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 2 }}
                className="h-1 mt-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsEditing(false)}
                className="flex items-center justify-center py-4 font-semibold text-gray-700 transition-all duration-300 border-2 border-gray-200 shadow-lg group bg-white/80 backdrop-blur-sm rounded-xl hover:border-gray-300 hover:bg-white hover:shadow-xl"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiX className="mr-2" size={18} />
                </motion.div>
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdateProfile}
                disabled={saving}
                className={`group py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl border border-white/20 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <motion.svg 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 mr-3 -ml-1 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    Saving...
                  </motion.span>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiSave className="mr-2" size={18} />
                    </motion.div>
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="relative flex items-center justify-center w-full py-4 overflow-hidden font-semibold text-white transition-all duration-300 border shadow-xl group bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 hover:shadow-2xl border-white/20"
            >
              {/* Shine Effect */}
              <motion.div
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <FiEdit className="mr-2" size={18} />
              </motion.div>
              Edit Profile
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={loggingOut}
            className={`group w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden ${loggingOut ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {/* Warning Glow Effect */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20"
            />
            
            {loggingOut ? (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 flex items-center justify-center"
              >
                <motion.svg 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 mr-3 -ml-1 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                Logging out...
              </motion.span>
            ) : (
              <span className="relative z-10 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.2, x: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiLogOut className="mr-2" size={18} />
                </motion.div>
                Logout
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}