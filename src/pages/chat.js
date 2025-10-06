'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import UnifiedSidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { doc, deleteDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ChatFooter from '@/components/Layout/Footer';
import PageLoader from '../components/Layout/PageLoader';

export default function Chat() {
  const { user, loading, contacts } = useAuth();
  const router = useRouter();
  const [activeContact, setActiveContact] = useState(null);
  const [lastSeen, setLastSeen] = useState({});
  const { messages, sendMessage } = useChat(activeContact ? [user?.uid, activeContact?.id].sort().join('_') : null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Track active contact's status
  useEffect(() => {
    if (!activeContact?.id) return;

    const userRef = doc(db, 'users', activeContact.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLastSeen(prev => ({
          ...prev,
          [activeContact.id]: data.lastSeen || 'offline'
        }));
      }
    });

    return () => unsubscribe();
  }, [activeContact]);

  const isOnline = (contactId) => {
    if (!contactId) return false;
    const timestamp = lastSeen[contactId];
    if (!timestamp || timestamp === 'offline') return false;

    const lastSeenDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    return (now - lastSeenDate) < 300000; // 5 minutes threshold
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp || timestamp === 'offline') return 'Offline';

    try {
      const lastSeenDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(lastSeenDate.getTime())) return 'Offline';

      const now = new Date();
      const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

      // If online now (within 5 minutes)
      if (diffSeconds < 300) return 'Online';

      const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };

      // Today
      if (lastSeenDate.toDateString() === now.toDateString()) {
        return `Last seen today at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastSeenDate.toDateString() === yesterday.toDateString()) {
        return `Last seen yesterday at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Within last 7 days
      if (diffSeconds < 604800) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Last seen on ${days[lastSeenDate.getDay()]} at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Older than 7 days
      return `Last seen on ${lastSeenDate.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })} at ${lastSeenDate.toLocaleTimeString([], options)}`;
    } catch (error) {
      console.error('Error formatting last seen:', error);
      return 'Offline';
    }
  };


  const handleDeleteMessage = async (messageId, deleteForEveryone) => {
    if (!user) return;

    try {
      if (deleteForEveryone) {
        await deleteDoc(doc(db, 'messages', messageId));
        toast.success('Message deleted for everyone');
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          deletedMessages: arrayUnion(messageId)
        });
        toast.success('Message deleted for you');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <UnifiedSidebar
          activeContact={activeContact}
          setActiveContact={setActiveContact}
        />

        <div className="relative flex flex-col flex-1 bg-sky-50">
          {activeContact ? (
            <>
              <div className="relative p-6 overflow-hidden border-b border-gray-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -10, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-8 h-8 rounded-full top-2 right-5 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-xl"
                  />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {/* Enhanced Avatar */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        <div className="flex items-center justify-center w-12 h-12 font-bold text-white border-2 rounded-full shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 border-white/50">
                          {activeContact.email.charAt(0).toUpperCase()}
                        </div>

                        {/* Online Status with Animation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${isOnline(activeContact.id) ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                        >
                          {isOnline(activeContact.id) && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold text-transparent truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
                      >
                        {activeContact.displayName || activeContact.email.split('@')[0]}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center mt-1 space-x-2"
                      >
                        {isOnline(activeContact.id) ? (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <p className="text-sm font-medium text-green-600">Online</p>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            <p className="text-sm text-gray-500">
                              {formatLastSeen(lastSeen[activeContact.id])}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveContact(null)}
                    className="p-2 text-gray-500 transition-all duration-200 border border-transparent rounded-xl hover:text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                    aria-label="Close chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <MessageList
                messages={messages.filter(msg =>
                  !user?.deletedMessages?.includes(msg.id)
                )}
                onDeleteMessage={handleDeleteMessage}
              />

              <ChatInput
                sendMessage={sendMessage}
                onNewContact={() => setActiveContact(null)}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg p-8 text-center transition-shadow duration-300 border border-indigo-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-2xl"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="flex items-center justify-center w-24 h-24 mx-auto mb-6 border-4 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 border-white/50"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </motion.svg>
                  <motion.div
                    animate={{ x: [-40, 80] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-0 skew-x-12 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text"
                >
                  Start a Conversation
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 text-lg leading-relaxed text-gray-600"
                >
                  Select a contact from your list to start chatting and connect with your friends
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center space-x-4 text-sm text-gray-500"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Secure messaging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Real-time chat</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <div className=''>
        <ChatFooter />
      </div>
    </div>
  );
}