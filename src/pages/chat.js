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
    return (
      <div className="fixed inset-0 bg-sky-50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
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
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <UnifiedSidebar
          activeContact={activeContact}
          setActiveContact={setActiveContact}
        />

        <div className="flex-1 flex flex-col bg-sky-50 relative">
          {activeContact ? (
            <>
              <div className="p-4 bg-sky-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center text-white font-medium">
                      {activeContact.email.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(activeContact.id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {activeContact.displayName || activeContact.email.split('@')[0]}
                    </h2>
                    <div className="flex items-center space-x-1">
                      {isOnline(activeContact.id) ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <p className="text-xs text-gray-500">Online</p>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          <p className="text-xs text-gray-500">
                          {formatLastSeen(lastSeen[activeContact.id])}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
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
            <div className="flex-1 flex flex-col items-center justify-center bg-sky-50">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-2xl text-gray-600 font-bold mb-4">Start a Conversation</h2>
                <p className="text-gray-600 mb-6">
                  Select a contact from your list to start chatting
                </p>
              </div>
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