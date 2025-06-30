// components/Chat/ChatInput.js
'use client'
import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSmile, FaTimes } from "react-icons/fa";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ sendMessage, onNewContact }) {
  const [message, setMessage] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAddContact}
            className="mb-4 flex items-center bg-sky-100 p-3 rounded-lg shadow-lg"
          >
            <input
              type="email"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              placeholder="Enter friend's email"
              className="flex-1 border border-gray-300 bg-white rounded-full py-2 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="ml-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-2 shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.form
        layout
        onSubmit={handleSubmit}
        className="flex items-end bg-sky-100 p-3 rounded-lg shadow-lg"
      >
        <div className="flex items-center mr-2 space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowContactForm(!showContactForm);
              setShowEmojiPicker(false);
            }}
            className="text-sky-700 hover:text-sky-600 hover:bg-sky-200 rounded-full p-2"
            aria-label="Add contact"
          >
            <PlusIcon className="h-6 w-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`text-yellow-500 hover:bg-sky-200 rounded-full p-2 ${showEmojiPicker ? 'text-yellow-500 bg-gray-300' : ''}`}
            aria-label="Add emoji"
          >
            <FaSmile className="h-6 w-6 bg-black rounded-full" />
          </motion.button>
        </div>

        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-white rounded-2xl py-3 px-4 text-gray-800 focus:outline-none focus:border-transparent -mb-2 resize-none max-h-28 overflow-y-auto transition-all duration-200 hide-scrollbar whitespace-pre-wrap"
            disabled={isSending}
            rows="1"
            style={{ minHeight: '48px' }}
          />
        </div>

        <motion.button
          whileHover={!message.trim() || isSending ? {} : { scale: 1.1 }}
          whileTap={!message.trim() || isSending ? {} : { scale: 0.95 }}
          type="submit"
          disabled={!message.trim() || isSending}
          className={`ml-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full p-2 shadow-sm ${!message.trim() || isSending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-6 w-6 transform" />
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
    </div>
  );
}