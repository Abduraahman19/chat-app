'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import ProfilePicture from '../ProfilePicture';

export default function ForwardModal({ 
  isOpen, 
  onClose, 
  contacts = [], 
  messages = [], 
  onForward 
}) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isForwarding, setIsForwarding] = useState(false);

  const handleContactToggle = (contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleForward = async () => {
    if (selectedContacts.length === 0) return;
    
    setIsForwarding(true);
    try {
      await onForward(messages, selectedContacts);
      onClose();
      setSelectedContacts([]);
    } catch (error) {
      console.error('Forward error:', error);
    } finally {
      setIsForwarding(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Forward {messages.length} message{messages.length > 1 ? 's' : ''}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Select contacts to forward to:
            </p>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactToggle(contact)}
                  className="flex items-center p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                >
                  <ProfilePicture user={contact} size="md" />
                  <div className="flex-1 ml-3">
                    <p className="font-medium text-gray-800">
                      {contact.displayName || contact.email.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedContacts.find(c => c.id === contact.id)
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedContacts.find(c => c.id === contact.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={selectedContacts.length === 0 || isForwarding}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isForwarding ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
              <span>{isForwarding ? 'Forwarding...' : 'Forward'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}