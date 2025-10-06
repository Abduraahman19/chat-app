'use client'
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUsernameFromEmail } from '../../utils/helpers';
import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { doc, onSnapshot, collection, query, where, updateDoc, arrayUnion, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiMoreVertical, FiEdit, FiCheck, FiPlus, FiUsers, FiMessageCircle, FiUser, FiClock, FiWifi, FiWifiOff } from 'react-icons/fi';

export default function UnifiedSidebar({ activeContact, setActiveContact }) {
  const { user, contacts, addContact } = useAuth();
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const [statuses, setStatuses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContactId, setEditingContactId] = useState(null);
  const [editedContactName, setEditedContactName] = useState('');
  const [contactCustomNames, setContactCustomNames] = useState({});
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [lastMessageTimes, setLastMessageTimes] = useState({});

  // Filter and sort contacts - sort by last message time, then alphabetically
  const filteredContacts = contacts
    .filter(contact => {
      const searchLower = searchQuery.toLowerCase();
      const displayName = contactCustomNames[contact.id] || contact.displayName || getUsernameFromEmail(contact.email);
      return (
        contact.email.toLowerCase().includes(searchLower) ||
        displayName.toLowerCase().includes(searchLower))
    })
    .sort((a, b) => {
      // Sort by last message time (most recent first), then alphabetically
      const lastMessageA = lastMessageTimes[a.id] || 0;
      const lastMessageB = lastMessageTimes[b.id] || 0;
      
      console.log(`Sorting: ${a.email} (${new Date(lastMessageA)}) vs ${b.email} (${new Date(lastMessageB)})`);
      
      if (lastMessageA !== lastMessageB) {
        const result = lastMessageB - lastMessageA; // Most recent first
        console.log(`Sort result: ${result}`);
        return result;
      }
      
      // If no messages or same time, sort alphabetically
      const nameA = (contactCustomNames[a.id] || a.displayName || getUsernameFromEmail(a.email)).toLowerCase();
      const nameB = (contactCustomNames[b.id] || b.displayName || getUsernameFromEmail(b.email)).toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Load saved contact names
  useEffect(() => {
    if (user?.uid) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.contactNames) {
            setContactCustomNames(data.contactNames);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Track unread messages count
  useEffect(() => {
    if (!user?.uid || !contacts.length) return;

    const unsubscribes = [];
    const counts = {};

    contacts.forEach(contact => {
      const chatId = [user.uid, contact.id].sort().join('_');
      const q = query(
        collection(db, 'chats', chatId, 'messages'),
        where('read', '==', false),
        where('senderId', '==', contact.id)
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          counts[contact.id] = snapshot.size;
          setUnreadCounts(prev => ({ ...prev, ...counts }));
        },
        (error) => {
          console.error("Error fetching unread messages:", error);
          setSnackbar({
            open: true,
            message: 'Failed to load unread messages',
            severity: 'error'
          });
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [contacts, user?.uid]);

  // Track contact statuses and last seen
  useEffect(() => {
    if (!contacts.length) return;

    const unsubscribes = contacts.map(contact => {
      const userRef = doc(db, 'users', contact.id);
      return onSnapshot(userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setLastSeen(prev => ({
              ...prev,
              [contact.id]: data.lastSeen || 'offline'
            }));
            setStatuses(prev => ({
              ...prev,
              [contact.id]: data.status || "Hey there! I'm using ChatApp"
            }));
          }
        },
        (error) => {
          console.error("Error fetching user status:", error);
          setSnackbar({
            open: true,
            message: 'Failed to load contact status',
            severity: 'error'
          });
        }
      );
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [contacts]);

  // Track last message times for each contact
  useEffect(() => {
    if (!user?.uid || !contacts.length) return;

    const unsubscribes = [];

    contacts.forEach(contact => {
      const chatId = [user.uid, contact.id].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          if (!snapshot.empty) {
            const lastMessage = snapshot.docs[0].data();
            const timestamp = lastMessage.timestamp?.toDate ? lastMessage.timestamp.toDate().getTime() : Date.now();
            
            console.log(`Last message time for ${contact.email}:`, new Date(timestamp));
            
            setLastMessageTimes(prev => {
              const updated = {
                ...prev,
                [contact.id]: timestamp
              };
              console.log('Updated lastMessageTimes:', updated);
              return updated;
            });
          } else {
            console.log(`No messages found for ${contact.email}`);
          }
        },
        (error) => {
          console.error("Error fetching last message:", error);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [contacts, user?.uid]);

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
        return `Today, ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastSeenDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Within last 7 days
      if (diffSeconds < 604800) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[lastSeenDate.getDay()]}, ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Older than 7 days
      return `${lastSeenDate.toLocaleDateString([], {
        day: 'numeric',
        month: 'short'
      })}, ${lastSeenDate.toLocaleTimeString([], options)}`;
    } catch (error) {
      console.error('Error formatting last seen:', error);
      return 'Offline';
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactEmail.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter an email address',
        severity: 'error'
      });
      return;
    }

    setIsAddingContact(true);
    try {
      await addContact(newContactEmail);

      // If a custom name was provided, save it
      if (editedContactName.trim()) {
        const contact = contacts.find(c => c.email === newContactEmail);
        if (contact) {
          setContactCustomNames(prev => ({
            ...prev,
            [contact.id]: editedContactName
          }));

          // Save to Firebase
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            [`contactNames.${contact.id}`]: editedContactName
          });
        }
      }

      setNewContactEmail('');
      setEditedContactName('');
      setShowAddContactModal(false);
      setSnackbar({
        open: true,
        message: 'Contact added successfully!',
        severity: 'success'
      });
    } catch (error) {
      let userMessage = error.message;

      // Customize specific error messages
      if (error.message.includes('No account found')) {
        userMessage = 'This user is not registered. Please ask them to create an account first.';
      } else if (error.message.includes('already in your list')) {
        userMessage = 'This contact is already in your list';
      }

      setSnackbar({
        open: true,
        message: userMessage,
        severity: 'error'
      });
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleContactClick = async (contact) => {
    setActiveContact(contact);

    // Update last interaction time for sorting
    setLastMessageTimes(prev => ({
      ...prev,
      [contact.id]: Date.now()
    }));

    // Mark messages as read when contact is selected
    if (unreadCounts[contact.id] > 0) {
      try {
        const chatId = [user.uid, contact.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(
          messagesRef,
          where('read', '==', false),
          where('senderId', '==', contact.id)
        );

        const snapshot = await getDocs(q);
        const batchUpdates = snapshot.docs.map(messageDoc =>
          updateDoc(doc(db, 'chats', chatId, 'messages', messageDoc.id), {
            read: true,
            readAt: new Date().toISOString()
          })
        );

        await Promise.all(batchUpdates);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditingContactId(contact.id);
    setEditedContactName(contactCustomNames[contact.id] || contact.displayName || getUsernameFromEmail(contact.email));
  };

  const handleSaveEdit = async (contactId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`contactNames.${contactId}`]: editedContactName
      });
      
      setContactCustomNames(prev => ({
        ...prev,
        [contactId]: editedContactName
      }));
      
      setEditingContactId(null);
      setEditedContactName('');
      
      setSnackbar({
        open: true,
        message: 'Contact name updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating contact name:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update contact name',
        severity: 'error'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditedContactName('');
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-5 right-5 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-5 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl"
        />
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 border-b border-gray-200/50 backdrop-blur-sm bg-white/70"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="mr-3 p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white shadow-lg"
            >
              <FiUsers size={20} />
            </motion.div>
            Contacts
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddContactModal(true)}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
          >
            <FiPlus size={18} />
          </motion.button>
        </div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiSearch className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-sm text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence>
          {filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-64 text-gray-500"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4"
              >
                <FiUsers size={24} className="text-gray-400" />
              </motion.div>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-sm text-gray-400 mt-1">Add some contacts to start chatting</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-2"
            >
              {filteredContacts.map((contact, index) => {
                const displayName = contactCustomNames[contact.id] || contact.displayName || getUsernameFromEmail(contact.email);
                const isActive = activeContact?.id === contact.id;
                const unreadCount = unreadCounts[contact.id] || 0;
                const contactIsOnline = isOnline(contact.id);
                const lastSeenText = formatLastSeen(lastSeen[contact.id]);
                const contactStatus = statuses[contact.id] || "Hey there! I'm using ChatApp";

                return (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`relative mb-2 rounded-xl transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl' 
                        : 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg border border-gray-200/50'
                    }`}
                  >
                    {/* Shine Effect for Active Contact */}
                    {isActive && (
                      <motion.div
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    )}
                    
                    <div 
                      onClick={() => handleContactClick(contact)}
                      className="p-4 cursor-pointer relative z-10"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                              isActive 
                                ? 'bg-white/20 text-white border-2 border-white/30' 
                                : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                            }`}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </motion.div>
                          
                          {/* Online Status Indicator */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                              isActive ? 'border-white' : 'border-white'
                            } flex items-center justify-center`}
                          >
                            {contactIsOnline ? (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-2 h-2 bg-green-500 rounded-full"
                              />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </motion.div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            {editingContactId === contact.id ? (
                              <div className="flex items-center space-x-2 flex-1">
                                <input
                                  type="text"
                                  value={editedContactName}
                                  onChange={(e) => setEditedContactName(e.target.value)}
                                  className={`flex-1 px-2 py-1 rounded border text-sm ${
                                    isActive 
                                      ? 'bg-white/20 border-white/30 text-white placeholder-white/70' 
                                      : 'bg-gray-50 border-gray-200 text-gray-800'
                                  }`}
                                  placeholder="Enter contact name"
                                  autoFocus
                                />
                                <motion.button
                                  whileHover={{ scale: 1.15, rotate: 5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleSaveEdit(contact.id)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isActive 
                                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 border border-green-400/30' 
                                      : 'bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 border border-green-200 shadow-sm hover:shadow-md'
                                  }`}
                                >
                                  <FiCheck size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.15, rotate: -5 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={handleCancelEdit}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isActive 
                                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-400/30' 
                                      : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 shadow-sm hover:shadow-md'
                                  }`}
                                >
                                  <FiX size={16} />
                                </motion.button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <motion.h3 
                                    whileHover={{ x: 2 }}
                                    className={`font-semibold truncate ${
                                      isActive ? 'text-white' : 'text-gray-800'
                                    }`}
                                  >
                                    {displayName}
                                  </motion.h3>
                                  <motion.p 
                                    initial={{ opacity: 0.7 }}
                                    animate={{ opacity: 1 }}
                                    className={`text-sm truncate flex items-center ${
                                      isActive ? 'text-white/80' : 'text-gray-500'
                                    }`}
                                  >
                                    {contactIsOnline ? (
                                      <>
                                        <FiWifi size={12} className="mr-1" />
                                        Online
                                      </>
                                    ) : (
                                      <>
                                        <FiClock size={12} className="mr-1" />
                                        {lastSeenText}
                                      </>
                                    )}
                                  </motion.p>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {/* Unread Count Badge */}
                                  {unreadCount > 0 && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      whileHover={{ scale: 1.1 }}
                                      className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg"
                                    >
                                      {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.div>
                                  )}
                                  
                                  {/* Edit Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(contact);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isActive 
                                        ? 'hover:bg-white/20 text-white/80' 
                                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                    }`}
                                  >
                                    <FiEdit size={14} />
                                  </motion.button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Contact Status */}
                          {!editingContactId && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.7 }}
                              className={`text-xs mt-1 truncate ${
                                isActive ? 'text-white/70' : 'text-gray-400'
                              }`}
                            >
                              {contactStatus}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed User Profile Section */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 p-4 border-t border-gray-200/50 backdrop-blur-sm bg-white/70 flex-shrink-0"
        >
          <Link href="/profile">
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 cursor-pointer border border-indigo-100 hover:border-indigo-200 shadow-sm hover:shadow-md"
            >
              {/* User Avatar */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white"
                >
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </motion.div>
                
                {/* Online Status */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </motion.div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <motion.h3 
                  whileHover={{ x: 2 }}
                  className="font-semibold text-gray-800 truncate"
                >
                  {user.displayName || getUsernameFromEmail(user.email)}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 truncate flex items-center"
                >
                  <FiUser size={12} className="mr-1" />
                  {user.email}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="text-xs text-indigo-600 font-medium mt-1"
                >
                  View Profile →
                </motion.p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Enhanced Add Contact Modal */}
      <AnimatePresence>
        {showAddContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mr-3 p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white shadow-lg"
                  >
                    <FiUser size={18} />
                  </motion.div>
                  Add Contact
                </motion.h3>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddContactModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <FiX size={20} />
                </motion.button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleAddContact} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 text-gray-700"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={editedContactName}
                    onChange={(e) => setEditedContactName(e.target.value)}
                    placeholder="Enter custom name"
                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 text-gray-700"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex space-x-3 pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddContactModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: isAddingContact ? 1 : 1.02, y: isAddingContact ? 0 : -2 }}
                    whileTap={{ scale: isAddingContact ? 1 : 0.98 }}
                    type="submit"
                    disabled={isAddingContact}
                    className={`flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 relative overflow-hidden ${isAddingContact ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {/* Shine Effect */}
                    {!isAddingContact && (
                      <motion.div
                        animate={{ x: [-100, 200] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    )}
                    
                    <span className="relative z-10 flex items-center justify-center">
                      {isAddingContact ? (
                        <>
                          <motion.svg 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="-ml-1 mr-3 h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </motion.svg>
                          Adding...
                        </>
                      ) : (
                        'Add Contact'
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            backgroundColor: snackbar.severity === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}