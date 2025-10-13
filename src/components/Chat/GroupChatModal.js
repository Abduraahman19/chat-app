'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ProfilePicture from '../ProfilePicture';

const GroupChatModal = ({ isOpen, onClose, contacts = [], onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Filter contacts based on search query - only show individual contacts, not groups
  const filteredContacts = contacts.filter(contact => {
    // Exclude groups from contact selection
    if (contact.isGroup) return false;
    
    const name = contact.displayName || contact.email.split('@')[0];
    const email = contact.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleContactToggle = (contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const createGroupChat = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedContacts.length < 1) {
      toast.error('Please select at least one contact');
      return;
    }

    setIsCreating(true);
    try {
      const groupId = `group_${user.uid}_${Date.now()}`;
      const participants = [user.uid, ...selectedContacts.map(c => c.id)];
      
      const participantNames = {
        [user.uid]: user.displayName || user.email.split('@')[0]
      };
      
      const participantPhotos = {
        [user.uid]: user.photoURL || ''
      };

      selectedContacts.forEach(contact => {
        participantNames[contact.id] = contact.displayName || contact.email.split('@')[0];
        participantPhotos[contact.id] = contact.photoURL || '';
      });

      await setDoc(doc(db, 'chats', groupId), {
        participants,
        participantNames,
        participantPhotos,
        groupName: groupName.trim(),
        isGroup: true,
        createdBy: user.uid,
        admins: [user.uid], // Multiple admins support
        superAdmin: user.uid, // Only super admin can make others admin
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        updatedAt: serverTimestamp()
      });

      toast.success('Group created successfully!');
      
      // Notify parent component about the new group
      if (onGroupCreated) {
        onGroupCreated({
          id: groupId,
          chatId: groupId,
          displayName: groupName.trim(),
          isGroup: true,
          participants,
          participantNames,
          participantPhotos,
          createdBy: user.uid,
          createdAt: new Date()
        });
      }
      
      onClose();
      setGroupName('');
      setSelectedContacts([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Create Group</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-700 hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Group Name Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={50}
              />
            </div>

            {/* Contact Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Add Members ({selectedContacts.length} selected)
              </label>
              
              {/* Search Bar */}
              <div className="relative mb-3">
                <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="overflow-y-auto border border-gray-200 rounded-lg max-h-80">
                {filteredContacts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No contacts found' : 'No contacts available'}
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                      className="flex items-center p-3 border-b border-gray-100 cursor-pointer last:border-b-0"
                      onClick={() => handleContactToggle(contact)}
                    >
                      <div className="flex items-center flex-1 space-x-3">
                        <ProfilePicture 
                          user={contact} 
                          size="md" 
                          animate={false}
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {contact.displayName || contact.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedContacts.find(c => c.id === contact.id)
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedContacts.find(c => c.id === contact.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            ✓
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createGroupChat}
              disabled={!groupName.trim() || selectedContacts.length === 0 || isCreating}
              className="flex items-center px-6 py-2 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 rounded-full border-white/60 border-t-white"
                />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
              <span>{isCreating ? 'Creating...' : 'Create Group'}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupChatModal;