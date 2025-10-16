'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { toast } from 'react-hot-toast';
import ProfilePicture from '../ProfilePicture';

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  groupData, 
  contacts = [],
  currentUserId
}) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [liveGroupData, setLiveGroupData] = useState(groupData);

  // Real-time group data updates
  useEffect(() => {
    if (!isOpen || !groupData?.chatId) return;

    const chatRef = doc(db, 'chats', groupData.chatId);
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setLiveGroupData({ ...doc.data(), chatId: groupData.chatId });
      }
    });

    return () => unsubscribe();
  }, [isOpen, groupData?.chatId]);

  if (!isOpen || !groupData) return null;

  const availableContacts = contacts.filter(contact => 
    contact.id !== currentUserId && !contact.isGroup
  );

  const handleAddMembers = async () => {
    if (selectedContacts.length === 0) return;
    
    setIsAdding(true);
    try {
      const chatRef = doc(db, 'chats', liveGroupData.chatId);
      const updateData = {
        participants: arrayUnion(...selectedContacts.map(c => c.id))
      };
      
      selectedContacts.forEach(contact => {
        updateData[`participantNames.${contact.id}`] = contact.displayName;
        updateData[`participantPhotos.${contact.id}`] = contact.photoURL;
      });
      
      await updateDoc(chatRef, updateData);
      toast.success(`${selectedContacts.length} member(s) added to group`);
      onClose();
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('Failed to add members');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleContact = (contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlusIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add Members</h2>
                <p className="text-sm text-gray-500">Select contacts to add to group</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableContacts.map((contact) => {
                const isSelected = selectedContacts.find(c => c.id === contact.id);
                const isAlreadyMember = liveGroupData.participants?.includes(contact.id);
                
                return (
                  <motion.div
                    key={contact.id}
                    whileHover={!isAlreadyMember ? { scale: 1.02 } : {}}
                    whileTap={!isAlreadyMember ? { scale: 0.98 } : {}}
                    onClick={() => !isAlreadyMember && toggleContact(contact)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isAlreadyMember
                        ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-green-500 bg-green-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ProfilePicture 
                        user={contact} 
                        size="md" 
                        animate={false}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{contact.displayName}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                        {isAlreadyMember && (
                          <p className="text-xs text-blue-600 font-medium">Already in group</p>
                        )}
                      </div>
                      {isAlreadyMember ? (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : isSelected ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
              {availableContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlusIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No contacts available</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {selectedContacts.length} selected
            </p>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={isAdding}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMembers}
                disabled={selectedContacts.length === 0 || isAdding}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Members</span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}