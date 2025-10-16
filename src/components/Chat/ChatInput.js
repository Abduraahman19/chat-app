// components/Chat/ChatInput.js
'use client'
import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSmile, FaTimes } from "react-icons/fa";
import { FiPaperclip } from 'react-icons/fi';
import { EllipsisVerticalIcon, TrashIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUpload from './MediaUpload';
import CameraCapture from './CameraCapture';
import ReplyPreview from './ReplyPreview';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';

export default function ChatInput({ sendMessage, onNewContact, chatId, activeContact, selectedMessages, onClearChat, onDeleteSelected, onForwardSelected, onClearSelection, onToggleSelectionMode, onLeaveGroup, onShowGroupInfo, onShowAddMember, onTransferOwnership, currentUser, replyingTo, onCancelReply, contacts, participantNames }) {
  const [message, setMessage] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const { user, addContact } = useAuth();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
      if (showOptionsMenu && optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showOptionsMenu]);

  // Typing indicator functions
  const updateTypingStatus = async (typing) => {
    if (!chatId || !user || !activeContact) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      const updateData = {};
      
      if (typing) {
        updateData[`typing.${user.uid}`] = serverTimestamp();
      } else {
        updateData[`typing.${user.uid}`] = null;
      }
      
      await updateDoc(chatRef, updateData);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 1500); // Reduced to 1.5 seconds for better UX
  };

  // Save draft when typing
  useEffect(() => {
    if (message && chatId) {
      const timer = setTimeout(() => {
        setDraft(message);
        localStorage.setItem(`draft_${chatId}`, message);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message, chatId]);

  // Load draft on chat change
  useEffect(() => {
    if (chatId) {
      const savedDraft = localStorage.getItem(`draft_${chatId}`);
      if (savedDraft && !message) {
        setMessage(savedDraft);
      }
    }
  }, [chatId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Trim only checks if message is empty, but preserves actual whitespace
    if (!message.replace(/\n/g, '').trim() || !user || isSending) return;

    const messageToSend = message; // Preserve all formatting including newlines
    setMessage('');
    
    // Clear draft
    localStorage.removeItem(`draft_${chatId}`);
    
    // Stop typing indicator immediately when sending
    setIsTyping(false);
    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsSending(true);
    try {
      await sendMessage(messageToSend, null, replyingTo);
      if (onCancelReply) onCancelReply();
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
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      // Only trigger typing for actual content changes
      handleTyping();
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const oldValue = message;
    
    setMessage(newValue);
    
    // Text formatting
    const formattedText = newValue
      .replace(/\*([^*]+)\*/g, '<b>$1</b>') // Bold
      .replace(/_([^_]+)_/g, '<i>$1</i>') // Italic
      .replace(/~([^~]+)~/g, '<s>$1</s>'); // Strikethrough
    
    // Only trigger typing if user is actually typing (adding characters)
    if (newValue.length > oldValue.length) {
      handleTyping();
    }
  };

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      updateTypingStatus(false);
    };
  }, [chatId]);

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
    <div className="relative p-4 border-t border-gray-200 bg-sky-50">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <ReplyPreview 
            replyingTo={replyingTo} 
            onCancel={onCancelReply}
            contacts={contacts}
            participantNames={participantNames}
          />
        )}
      </AnimatePresence>
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
            className="relative flex items-center p-4 mb-4 overflow-hidden border shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl border-white/50"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-indigo-50/50 via-transparent to-purple-50/50" />
            
            <div className="relative z-10 flex items-center w-full space-x-3">
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="Enter friend's email"
                className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 transition-all duration-300 border-2 border-gray-200 bg-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="relative p-3 overflow-hidden text-white transition-all duration-300 border shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:shadow-xl border-white/20"
              >
                {/* Shine Effect */}
                <motion.div
                  animate={{ x: [-20, 40] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <PlusIcon className="relative z-10 w-5 h-5" />
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.form
        layout
        onSubmit={handleSubmit}
        className="relative flex items-center p-3 overflow-hidden border shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl border-white/50"
      >

        {/* Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-indigo-50/30 via-transparent to-purple-50/30" />
        
        <div className="relative z-10 flex items-center mr-3 space-x-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowContactForm(!showContactForm);
              setShowEmojiPicker(false);
              setShowMediaUpload(false);
              setShowOptionsMenu(false);
            }}
            className="flex items-center justify-center w-10 h-10 p-2 text-indigo-600 transition-all duration-300 border border-transparent hover:text-indigo-700 hover:bg-indigo-50 rounded-xl hover:border-indigo-200"
            aria-label="Add contact"
          >
            <PlusIcon className="w-5 h-5" />
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setShowMediaUpload(!showMediaUpload);
                setShowEmojiPicker(false);
                setShowContactForm(false);
                setShowOptionsMenu(false);
              }}
              className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
                showMediaUpload 
                  ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300 shadow-lg' 
                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-200 text-purple-600'
              }`}
              aria-label="Attach media"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 hover:opacity-100" />
              
              <motion.div
                animate={showMediaUpload ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: showMediaUpload ? Infinity : 0, repeatDelay: 2 }}
                className="relative z-10"
              >
                <FiPaperclip className="w-5 h-5" />
              </motion.div>
              
              {showMediaUpload && (
                <motion.div
                  animate={{ x: [-20, 40] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              )}
            </motion.button>

            {/* Quick attachment options */}
            <AnimatePresence>
              {showMediaUpload && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-12 left-0 z-20 flex flex-col gap-2"
                >
                  {/* Camera option */}
                  <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowCameraCapture(true);
                      setShowMediaUpload(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    📷 Camera
                  </motion.button>

                  {/* Gallery option */}
                  <motion.button
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      // Keep existing media upload modal
                      // Modal will handle gallery selection
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    🖼️ Gallery
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowMediaUpload(false);
              setShowContactForm(false);
              setShowOptionsMenu(false);
            }}
            className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
              showEmojiPicker 
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 shadow-lg' 
                : 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-200'
            }`}
            aria-label="Add emoji"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 hover:opacity-100" />
            
            {/* Enhanced Emoji */}
            <motion.div
              animate={showEmojiPicker ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: showEmojiPicker ? Infinity : 0, repeatDelay: 2 }}
              className="relative z-10 flex items-center justify-center text-lg"
            >
              😊
            </motion.div>
            
            {/* Shine Effect */}
            {showEmojiPicker && (
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setShowOptionsMenu(!showOptionsMenu);
              setShowEmojiPicker(false);
              setShowMediaUpload(false);
              setShowContactForm(false);
            }}
            className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
              showOptionsMenu 
                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 shadow-lg text-indigo-700' 
                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50 hover:border-gray-200 text-gray-600'
            }`}
            aria-label="Chat options"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <motion.div
              animate={showOptionsMenu ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: showOptionsMenu ? Infinity : 0, repeatDelay: 2 }}
              className="relative z-10"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </motion.div>
            
            {showOptionsMenu && (
              <motion.div
                animate={{ x: [-20, 40] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            )}
          </motion.button>
        </div>

        <div className="relative z-10 flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-4 py-3 overflow-y-auto text-gray-800 placeholder-gray-400 whitespace-pre-wrap transition-all duration-300 border-2 border-gray-200 shadow-sm resize-none bg-white/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-h-28 hide-scrollbar"
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
              className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
          
          <motion.div
            animate={isSending ? { rotate: 360 } : {}}
            transition={isSending ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            className="relative z-10"
          >
            <PaperAirplaneIcon className="w-5 h-5 transform" />
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
            className="absolute z-10 bottom-24 left-4"
          >
            <div className="overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-xl hide-scrollbar">
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-700">Emoji</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 text-gray-500 rounded-full hover:text-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
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

      <AnimatePresence>
        {showOptionsMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={optionsMenuRef}
            className="absolute bottom-24 left-4 z-10"
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 hide-scrollbar">
              <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-700">Options</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowOptionsMenu(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
                >
                  <FaTimes className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="h-60 w-[280px] overflow-y-auto hide-scrollbar">
                {selectedMessages.length > 0 && (
                  <div className="p-3 border-b border-gray-200 bg-indigo-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-700">
                        {selectedMessages.length} selected
                      </span>
                      <button
                        onClick={() => {
                          onClearSelection();
                          setShowOptionsMenu(false);
                        }}
                        className="p-1 text-indigo-500 hover:text-indigo-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="py-2">
                  <button
                    onClick={() => {
                      if (onToggleSelectionMode) {
                        onToggleSelectionMode();
                      } else {
                        // Temporary fallback - you can implement this later
                        console.log('Selection mode toggle not implemented yet');
                      }
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-left text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Select Messages</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Group Options - Only for groups */}
                  {activeContact?.isGroup && (
                    <>
                      <button
                        onClick={() => {
                          if (onShowGroupInfo) {
                            onShowGroupInfo();
                          }
                          setShowOptionsMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-left text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Group Info</span>
                      </button>
                      
                      {/* Only show Add Member if user has permission */}
                      {(activeContact.admins?.includes(currentUser?.uid) || 
                        activeContact.superAdmin === currentUser?.uid || 
                        activeContact.addMemberPermissions?.includes(currentUser?.uid)) && (
                        <button
                          onClick={() => {
                            if (onShowAddMember) {
                              onShowAddMember();
                            }
                            setShowOptionsMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-3 space-x-3 text-left text-green-600 transition-colors hover:bg-green-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Add Member</span>
                        </button>
                      )}
                      
                      {/* Only show Transfer Ownership for super admin */}
                      {activeContact.superAdmin === currentUser?.uid && (
                        <button
                          onClick={() => {
                            if (onTransferOwnership) {
                              onTransferOwnership();
                            }
                            setShowOptionsMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-3 space-x-3 text-left text-purple-600 transition-colors hover:bg-purple-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span>Transfer Ownership</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (onLeaveGroup) {
                            onLeaveGroup();
                          }
                          setShowOptionsMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-left text-orange-600 transition-colors hover:bg-orange-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Leave Group</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      onClearChat();
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Clear Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedMessages.length > 0) {
                        onDeleteSelected(selectedMessages);
                        setShowOptionsMenu(false);
                      }
                    }}
                    disabled={selectedMessages.length === 0}
                    className={`flex items-center w-full px-4 py-3 space-x-3 text-left transition-colors ${
                      selectedMessages.length > 0 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>
                      Delete Selected {selectedMessages.length > 0 ? `(${selectedMessages.length})` : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedMessages.length > 0) {
                        onForwardSelected(selectedMessages);
                        setShowOptionsMenu(false);
                      }
                    }}
                    disabled={selectedMessages.length === 0}
                    className={`flex items-center w-full px-4 py-3 space-x-3 text-left transition-colors ${
                      selectedMessages.length > 0 
                        ? 'text-blue-600 hover:bg-blue-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                    <span>
                      Forward Selected {selectedMessages.length > 0 ? `(${selectedMessages.length})` : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Upload Modal - Only show when gallery is clicked */}
      {showMediaUpload && (
        <MediaUpload
          onMediaSelect={handleMediaSelect}
          onClose={() => setShowMediaUpload(false)}
        />
      )}

      {/* Camera Capture Modal */}
      {showCameraCapture && (
        <CameraCapture
          onCapture={async (file) => {
            try {
              const mediaData = {
                type: 'image',
                url: URL.createObjectURL(file),
                fileName: file.name,
                fileSize: file.size,
                format: 'jpeg',
                originalType: file.type
              };
              await handleMediaSelect(mediaData, '');
              setShowCameraCapture(false);
            } catch (error) {
              console.error('Error handling camera capture:', error);
              toast.error('Failed to process camera image');
            }
          }}
          onClose={() => setShowCameraCapture(false)}
        />
      )}
    </div>
  );
}