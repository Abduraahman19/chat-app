'use client'
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { getUsernameFromEmail } from '../../utils/helpers';
import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { doc, onSnapshot, collection, query, where, updateDoc, arrayUnion, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { motion } from 'framer-motion';
import { FiX, FiSearch, FiMoreVertical, FiEdit, FiCheck } from 'react-icons/fi';

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

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = contactCustomNames[contact.id] || contact.displayName || getUsernameFromEmail(contact.email);
    return (
      contact.email.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower))
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
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleContactClick = async (contact) => {
    setActiveContact(contact);

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

  const handleSaveName = async (contactId) => {
    try {
      setContactCustomNames(prev => ({
        ...prev,
        [contactId]: editedContactName
      }));
      setEditingContactId(null);

      // Save to Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`contactNames.${contactId}`]: editedContactName
      });

      setSnackbar({
        open: true,
        message: 'Contact name updated!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating contact name:", error);
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
    <div className="w-80 bg-sky-50 border-r border-gray-300 flex flex-col h-full">
      {/* Navigation Section */}
      <div className="p-4 border-b border-gray-300">
        <h2 className="font-bold text-gray-800 text-lg mb-3">Navigation</h2>
        <nav className="space-y-2">
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-sky-100 border border-transparent hover:border-sky-200 hover:ring-1 hover:ring-sky-200 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </nav>
      </div>

      {/* Contacts Section */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="font-bold text-gray-800 text-lg">Contacts</h2>
          <span className="bg-sky-200 text-sky-700 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
            {filteredContacts.length}/{contacts.length}
          </span>
        </div>
        <button
          onClick={() => setShowAddContactModal(true)}
          className="text-sky-600 hover:text-sky-500 text-sm font-medium"
        >
          + Add Contact
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="p-2 border-b border-gray-300 from-sky-50">
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500 pl-2 pb-1"
          >
            {searchQuery ? (
              <span>
                Showing <span className="font-medium text-blue-600">{filteredContacts.length}</span> of{' '}
                <span className="font-medium">{contacts.length}</span> contacts
              </span>
            ) : (
              <span className="font-medium">{contacts.length} contacts</span>
            )}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
          </div>

          <input
            type="text"
            placeholder="Search contacts..."
            className="block w-full pl-5 pr-5 py-1.5 border text-gray-700 border-gray-200 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center group"
              aria-label="Clear search"
            >
              <FiX className="text-gray-400 hover:text-rose-500 transition-colors duration-200 transform hover:scale-110" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {contacts.length === 0
              ? "No contacts yet. Add some friends to start chatting!"
              : "No contacts match your search"}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <motion.li
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-3 cursor-pointer hover:bg-sky-100 transition-colors ${activeContact?.id === contact.id ? 'bg-sky-100' : ''}`}
                onClick={() => handleContactClick(contact)} // Move the click handler here
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center text-white font-medium mr-3">
                      {contact.email.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-2 w-3 h-3 rounded-full border-2 border-white ${isOnline(contact.id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <div className="flex-col truncate relative">
                        {editingContactId === contact.id ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={editedContactName}
                              onChange={(e) => setEditedContactName(e.target.value)}
                              className="w-full px-2 py-1 pr-10 border-b border-gray-300 text-gray-700 focus:border-blue-500 outline-none bg-transparent"
                              autoFocus
                            />
                            <div className="absolute -right-1 top-0 flex">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveName(contact.id);
                                }}
                                className="text-green-500 hover:text-green-700 p-1"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-900 truncate">
                            {contactCustomNames[contact.id] || contact.displayName || getUsernameFromEmail(contact.email)}
                          </p>
                        )}
                        <p className='text-gray-700 text-sm truncate'>{contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCounts[contact.id] > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
                            {unreadCounts[contact.id]}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(contact);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500 truncate max-w-[180px]">
                        {statuses[contact.id] || "Hey there! I'm using ChatApp"}
                      </p>
                      <div className="flex items-center space-x-1">
                        {isOnline(contact.id) ? (
                          <span className="text-xs text-green-500">Online</span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {formatLastSeen(lastSeen[contact.id])}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-gray-300 bg-sky-50">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-700 flex items-center justify-center text-white font-medium mr-3">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-2 w-3 h-3 rounded-full border-2 border-white ${isOnline(user.uid) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.displayName || getUsernameFromEmail(user.email)}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Contact</h3>
              <button
                onClick={() => {
                  setShowAddContactModal(false);
                  setNewContactEmail('');
                  setEditedContactName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact's email"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={editedContactName}
                  onChange={(e) => setEditedContactName(e.target.value)}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a custom name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContactModal(false);
                    setNewContactEmail('');
                    setEditedContactName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}