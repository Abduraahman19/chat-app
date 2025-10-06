// components/Chat/ChatInput.js
'use client'
import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSmile, FaTimes } from "react-icons/fa";
import { FiPaperclip } from 'react-icons/fi';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUpload from './MediaUpload';

export default function ChatInput({ sendMessage, onNewContact }) {
  const [message, setMessage] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user, addContact } = useAuth();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSending, showContactForm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Trim only checks if message is empty, but preserves actual whitespace
    if (!message.replace(/\n/g, '').trim() || !user || isSending) return;

    const messageToSend = message; // Preserve all formatting including newlines
    setMessage('');

    setIsSending(true);
    try {
      await sendMessage(messageToSend);
    } catch (error) {
      setMessage(messageToSend); // Restore with original formatting
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await addContact(newContactEmail);
      setNewContactEmail('');
      setShowContactForm(false);
      toast.success('Contact added successfully!');
      if (onNewContact) onNewContact();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji.native);
    inputRef.current.focus();
  };

  const handleMediaSelect = async (mediaData, messageText = '') => {
    try {
      await sendMessage(messageText, mediaData);
      toast.success('Media sent successfully!');
    } catch (error) {
      console.error('Error sending media:', error);
      toast.error('Failed to send media');
    }
  };

  return (
    <div className="p-4 bg-sky-50 border-t border-gray-200 relative">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <AnimatePresence>
        {showContactForm && (
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            onSubmit={handleAddContact}
            className="mb-4 flex items-center bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 relative overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-purple-50/50 pointer-events-none" />
            
            <div className="relative z-10 flex items-center w-full space-x-3">
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="Enter friend's email"
                className="flex-1 border-2 border-gray-200 bg-white/90 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400"
                required
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 relative overflow-hidden"
              >
                {/* Shine Effect */}
                <motion.div
                  animate={{ x: [-20, 40] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                <PlusIcon className="h-5 w-5 relative z-10" />
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.form
        layout
        onSubmit={handleSubmit}
        className="flex items-center bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/50 relative overflow-hidden"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-transparent to-purple-50/30 pointer-events-none" />
        
        <div className="flex items-center mr-3 space-x-2 relative z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowContactForm(!showContactForm);
              setShowEmojiPicker(false);
              setShowMediaUpload(false);
            }}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl p-2 transition-all duration-300 border border-transparent hover:border-indigo-200 flex items-center justify-center w-10 h-10"
            aria-label="Add contact"
          >
            <PlusIcon className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowMediaUpload(!showMediaUpload);
              setShowEmojiPicker(false);
              setShowContactForm(false);
            }}
            className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
              showMediaUpload 
                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300 shadow-lg' 
                : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-200 text-purple-600'
            }`}
            aria-label="Attach media"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <motion.div
              animate={showMediaUpload ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: showMediaUpload ? Infinity : 0, repeatDelay: 2 }}
              className="relative z-10"
            >
              <FiPaperclip className="h-5 w-5" />
            </motion.div>
            
            {showMediaUpload && (
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowMediaUpload(false);
              setShowContactForm(false);
            }}
            className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
              showEmojiPicker 
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 shadow-lg' 
                : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-200'
            }`}
            aria-label="Add emoji"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {/* Enhanced Emoji */}
            <motion.div
              animate={showEmojiPicker ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: showEmojiPicker ? Infinity : 0, repeatDelay: 2 }}
              className="relative z-10 text-lg flex items-center justify-center"
            >
              😊
            </motion.div>
            
            {/* Shine Effect */}
            {showEmojiPicker && (
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>
        </div>

        <div className="relative flex-1 z-10">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-white/90 rounded-2xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-2 border-gray-200 resize-none max-h-28 overflow-y-auto transition-all duration-300 hide-scrollbar whitespace-pre-wrap placeholder-gray-400 shadow-sm"
            disabled={isSending}
            rows="1"
            style={{ minHeight: '40px' }}
          />
        </div>

        <motion.button
          whileHover={!message.trim() || isSending ? {} : { scale: 1.1, rotate: 15 }}
          whileTap={!message.trim() || isSending ? {} : { scale: 0.95 }}
          type="submit"
          disabled={!message.trim() || isSending}
          className={`ml-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 relative overflow-hidden z-10 flex items-center justify-center w-10 h-10 ${
            !message.trim() || isSending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Send message"
        >
          {/* Shine Effect */}
          {message.trim() && !isSending && (
            <motion.div
              animate={{ x: [-20, 40] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          )}
          
          <motion.div
            animate={isSending ? { rotate: 360 } : {}}
            transition={isSending ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="relative z-10"
          >
            <PaperAirplaneIcon className="h-5 w-5 transform" />
          </motion.div>
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={emojiPickerRef}
            className="absolute bottom-24 left-4 z-10"
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 hide-scrollbar">
              <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-700">Emoji</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
                >
                  <FaTimes className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="h-80 w-[340px] overflow-y-auto hide-scrollbar">
                <Picker
                  data={data}
                  onEmojiSelect={addEmoji}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="search"
                  categories={[
                    'frequent',
                    'people',
                    'nature',
                    'foods',
                    'activity',
                    'places',
                    'objects',
                    'symbols',
                    'flags'
                  ]}
                  perLine={9}
                  emojiSize={24}
                  emojiButtonSize={36}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload
          onMediaSelect={handleMediaSelect}
          onClose={() => setShowMediaUpload(false)}
        />
      )}
    </div>
  );
}