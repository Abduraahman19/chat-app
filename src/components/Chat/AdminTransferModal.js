'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import ProfilePicture from '../ProfilePicture';

export default function AdminTransferModal({ 
  isOpen, 
  onClose, 
  groupData, 
  contacts = [],
  onTransferAdmin,
  currentUserId
}) {
  const [selectedNewAdmin, setSelectedNewAdmin] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  if (!isOpen || !groupData) return null;

  const eligibleMembers = groupData.participants?.filter(id => id !== currentUserId) || [];

  const getContactInfo = (memberId) => {
    const contact = contacts.find(c => c.id === memberId);
    return {
      name: groupData.participantNames?.[memberId] || contact?.displayName || 'Unknown',
      photoURL: groupData.participantPhotos?.[memberId] || contact?.photoURL
    };
  };

  const handleTransfer = async () => {
    if (!selectedNewAdmin) return;
    
    setIsTransferring(true);
    try {
      await onTransferAdmin(selectedNewAdmin);
    } finally {
      setIsTransferring(false);
    }
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Transfer Admin Rights</h2>
                <p className="text-sm text-gray-600">Select a new admin before leaving</p>
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

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> You must select a new admin before leaving the group. 
                The selected member will receive full admin privileges.
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {eligibleMembers.map((memberId) => {
                const memberInfo = getContactInfo(memberId);
                const isSelected = selectedNewAdmin === memberId;

                return (
                  <motion.div
                    key={memberId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedNewAdmin(memberId)}
                    className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ProfilePicture 
                        user={{ 
                          photoURL: memberInfo.photoURL,
                          displayName: memberInfo.name 
                        }} 
                        size="md" 
                        animate={false}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{memberInfo.name}</p>
                        <p className="text-sm text-gray-500">Will become group admin</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isTransferring}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTransfer}
              disabled={!selectedNewAdmin || isTransferring}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isTransferring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <span>Transfer & Leave</span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}