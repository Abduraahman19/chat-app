'use client'
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RiCheckDoubleLine } from "react-icons/ri";
import MessageStatus from './MessageStatus';
import { EllipsisVerticalIcon, DocumentDuplicateIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';
import { Slide } from '@mui/material';
import ProfilePicture from '../ProfilePicture';
import MediaMessage from './MediaMessage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReactionsPopup from './ReactionsPopup';
import { FaTimes } from "react-icons/fa";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Message = ({ message, onDelete, showTime = false, senderInfo = null, isGroupChat = false, participantNames = {}, contacts = [], isSelected = false, onSelect, selectionMode = false, activeContact = null, onFullscreenOpen, onReply, onStar, onScrollToMessage }) => {
  const { user } = useAuth();
  const isCurrentUser = message.senderId === user?.uid;

  // Get sender name for group chats
  const getSenderName = () => {
    if (!isGroupChat || isCurrentUser) return null;
    return participantNames[message.senderId] || senderInfo?.displayName || 'Unknown';
  };
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const reactionsRef = useRef(null);
  const reactionsPopupRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  const messageReactions = message.reactions || {};

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Skip if reactions popup is open (handled by dedicated handler)
      if (showReactionsPopup) return;

      // Check if click is outside all popup elements
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(e.target);
      const isOutsideButton = !buttonRef.current?.contains(e.target);
      const isOutsideReactions = !reactionsRef.current?.contains(e.target);
      const isOutsideEmojiPicker = !emojiPickerRef.current?.contains(e.target);

      if (isOutsideMenu && isOutsideButton && isOutsideReactions && isOutsideEmojiPicker) {
        setShowMenu(false);
        setShowDeleteOptions(false);
        setShowReactions(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactionsPopup]);

  // Separate handler for emoji picker
  useEffect(() => {
    const handleEmojiPickerOutside = (e) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleEmojiPickerOutside);
      return () => document.removeEventListener('mousedown', handleEmojiPickerOutside);
    }
  }, [showEmojiPicker]);

  // Dedicated handler for reactions popup - closes on any outside click
  useEffect(() => {
    const handleReactionsPopupOutside = (e) => {
      if (showReactionsPopup && reactionsPopupRef.current && !reactionsPopupRef.current.contains(e.target)) {
        setShowReactionsPopup(false);
      }
    };

    if (showReactionsPopup) {
      document.addEventListener('mousedown', handleReactionsPopupOutside, true);
      document.addEventListener('touchstart', handleReactionsPopupOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleReactionsPopupOutside, true);
        document.removeEventListener('touchstart', handleReactionsPopupOutside, true);
      };
    }
  }, [showReactionsPopup]);

  // Separate handler for quick reactions
  useEffect(() => {
    const handleReactionsOutside = (e) => {
      if (showReactions && reactionsRef.current && !reactionsRef.current.contains(e.target)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleReactionsOutside);
      return () => document.removeEventListener('mousedown', handleReactionsOutside);
    }
  }, [showReactions]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const SlideTransition = (props) => {
    return <Slide {...props} direction="left" />;
  };

  const handleDelete = (deleteForEveryone) => {
    onDelete(message.id, deleteForEveryone);
    setShowDeleteOptions(false);
    setShowMenu(false);
    setSnackbar({
      open: true,
      message: deleteForEveryone ? 'Message deleted for everyone' : 'Message deleted for you',
      severity: 'success'
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Message copied to clipboard!',
          severity: 'success'
        });
      })
      .catch((err) => {
        console.error('Failed to copy message: ', err);
        setSnackbar({
          open: true,
          message: 'Failed to copy message',
          severity: 'error'
        });
      });
    setShowDeleteOptions(false);
    setShowMenu(false);
  };

  const handleReaction = async (emoji) => {
    try {
      const messageRef = doc(db, 'messages', message.id);

      // Find user's current reaction
      let currentUserReaction = null;
      Object.entries(messageReactions).forEach(([reactionEmoji, users]) => {
        if (users.includes(user.uid)) {
          currentUserReaction = reactionEmoji;
        }
      });

      // If clicking same reaction, remove it
      if (currentUserReaction === emoji) {
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayRemove(user.uid)
        });
      } else {
        // Remove from previous reaction if exists
        if (currentUserReaction) {
          await updateDoc(messageRef, {
            [`reactions.${currentUserReaction}`]: arrayRemove(user.uid)
          });
        }

        // Add to new reaction
        await updateDoc(messageRef, {
          [`reactions.${emoji}`]: arrayUnion(user.uid)
        });
      }

      setShowReactions(false);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Format time for message footer
  const formatTime = (date) => {
    if (!date) return '';
    if (date.toDate) date = date.toDate();
    const jsDate = new Date(date);
    return jsDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} px-4 py-1 relative group ${isSelected ? 'bg-indigo-50/50' : ''
          }`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => {
          if (!showDeleteOptions && !showReactions) {
            setShowMenu(false);
          }
        }}
        onClick={() => {
          if (selectionMode && onSelect) {
            onSelect(message.id);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {/* Profile picture for received messages - Always on left */}
          {!isCurrentUser && (isGroupChat || senderInfo) && (
            <div className="flex-shrink-0">
              {senderInfo?.photoURL ? (
                <ProfilePicture
                  user={senderInfo}
                  size="md"
                  animate={false}
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                  {(participantNames[message.senderId] || senderInfo?.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Message options for YOUR messages - Left side */}
          {isCurrentUser && (
            <div className="flex items-center space-x-2">
              {/* Reaction button */}
              <AnimatePresence>
                {(showMenu || showReactions) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 mr-2 text-yellow-600 transition-all duration-300 border rounded-full shadow-lg bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border-yellow-200/50 backdrop-blur-sm"
                      onClick={() => setShowReactions(!showReactions)}
                    >
                      <FaceSmileIcon className="w-4 h-4" />
                    </motion.button>

                    {/* Reactions picker */}
                    <AnimatePresence>
                      {showReactions && (
                        <motion.div
                          ref={reactionsRef}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute z-30 flex gap-1 p-2 transform -translate-x-1/2 border shadow-2xl left-1/2 top-12 bg-white/95 backdrop-blur-xl rounded-xl border-white/50"
                        >
                          {reactions.map((emoji) => (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleReaction(emoji)}
                              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${messageReactions[emoji]?.includes(user.uid) ? 'bg-blue-100' : ''
                                }`}
                            >
                              <span className="text-lg">{emoji}</span>
                            </motion.button>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setShowReactions(false);
                              setShowEmojiPicker(true);
                            }}
                            className="p-2 transition-colors border border-yellow-200 rounded-lg hover:bg-yellow-100 bg-yellow-50"
                          >
                            <span className="text-lg text-yellow-600">+</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message options menu for YOUR messages */}
              <AnimatePresence>
                {(showMenu || showDeleteOptions) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <motion.button
                      ref={buttonRef}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 mr-2 text-indigo-600 transition-all duration-300 border rounded-full shadow-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 border-indigo-200/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteOptions(!showDeleteOptions);
                      }}
                    >
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </motion.button>

                    {/* Message options dropdown */}
                    <AnimatePresence>
                      {showDeleteOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          ref={menuRef}
                          className="absolute z-20 overflow-hidden transform -translate-x-1/2 border shadow-2xl top-12 left-1/2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl border-white/50"
                        >
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50" />

                          <div className="relative z-10">
                            {/* Reply to message */}
                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (onReply) onReply(message);
                                setShowDeleteOptions(false);
                                setShowMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply
                            </motion.button>

                            {/* Copy message - Show for all messages with text */}
                            {message.text && (
                              <motion.button
                                whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCopy}
                                className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 mr-3 text-indigo-500" />
                                Copy message
                              </motion.button>
                            )}

                            {/* Star message */}
                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (onStar) onStar(message.id);
                                setShowDeleteOptions(false);
                                setShowMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              <svg className="w-4 h-4 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              Star
                            </motion.button>

                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDelete(false)}
                              className="w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              Delete for me
                            </motion.button>

                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDelete(true)}
                              className="w-full px-4 py-3 text-sm font-medium text-left text-red-600 transition-all duration-200 border-b hover:bg-red-50 border-gray-100/50"
                            >
                              Delete for everyone
                            </motion.button>

                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(156, 163, 175, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowDeleteOptions(false)}
                              className="w-full px-4 py-3 text-sm font-medium text-left text-gray-500 transition-all duration-200 hover:bg-gray-50"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Message options for OTHERS' messages - Right side */}
          {!isCurrentUser && (
            <div className="flex items-center order-last ml-4 space-x-2">
              {/* Reaction button */}
              <AnimatePresence>
                {(showMenu || showReactions) && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 mr-2 text-yellow-600 transition-all duration-300 border rounded-full shadow-lg bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border-yellow-200/50 backdrop-blur-sm"
                      onClick={() => setShowReactions(!showReactions)}
                    >
                      <FaceSmileIcon className="w-4 h-4" />
                    </motion.button>

                    {/* Reactions picker */}
                    <AnimatePresence>
                      {showReactions && (
                        <motion.div
                          ref={reactionsRef}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute z-30 flex gap-1 p-2 transform -translate-x-1/2 border shadow-2xl left-1/2 top-12 bg-white/95 backdrop-blur-xl rounded-xl border-white/50"
                        >
                          {reactions.map((emoji) => (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleReaction(emoji)}
                              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${messageReactions[emoji]?.includes(user.uid) ? 'bg-blue-100' : ''
                                }`}
                            >
                              <span className="text-lg">{emoji}</span>
                            </motion.button>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setShowReactions(false);
                              setShowEmojiPicker(true);
                            }}
                            className="p-2 transition-colors border border-yellow-200 rounded-lg hover:bg-yellow-100 bg-yellow-50"
                          >
                            <span className="text-lg text-yellow-600">+</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message options menu for OTHERS' messages */}
              <AnimatePresence>
                {(showMenu || showDeleteOptions) && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <motion.button
                      ref={buttonRef}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 mr-2 text-indigo-600 transition-all duration-300 border rounded-full shadow-lg bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 border-indigo-200/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteOptions(!showDeleteOptions);
                      }}
                    >
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </motion.button>

                    {/* Message options dropdown for OTHERS' messages */}
                    <AnimatePresence>
                      {showDeleteOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          ref={menuRef}
                          className="absolute z-20 overflow-hidden transform -translate-x-1/2 border shadow-2xl top-12 left-1/2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl border-white/50"
                        >
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50" />

                          <div className="relative z-10">
                            {/* Reply to message */}
                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (onReply) onReply(message);
                                setShowDeleteOptions(false);
                                setShowMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Reply
                            </motion.button>

                            {/* Copy message - Show for all messages with text */}
                            {message.text && (
                              <motion.button
                                whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCopy}
                                className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 mr-3 text-indigo-500" />
                                Copy message
                              </motion.button>
                            )}

                            {/* Star message */}
                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (onStar) onStar(message.id);
                                setShowDeleteOptions(false);
                                setShowMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              <svg className="w-4 h-4 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              Star
                            </motion.button>

                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDelete(false)}
                              className="w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                            >
                              Delete for me
                            </motion.button>

                            <motion.button
                              whileHover={{ x: 2, backgroundColor: 'rgba(156, 163, 175, 0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowDeleteOptions(false)}
                              className="w-full px-4 py-3 text-sm font-medium text-left text-gray-500 transition-all duration-200 hover:bg-gray-50"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Selection checkbox */}
          {selectionMode && (
            <div className={`flex items-center ${isCurrentUser ? 'order-first mr-2' : 'order-last ml-2'}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(message.id);
                }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${isSelected
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-gray-300 hover:border-indigo-400'
                  }`}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-white"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            </div>
          )}

          {/* Enhanced Message bubble */}
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm border shadow-lg transition-all duration-300 overflow-hidden ${isCurrentUser
                ? 'bg-[#005D4B] text-white rounded-tr-md border-green-400/30'
                : 'bg-white/90 text-gray-800 rounded-tl-md border-gray-200/50'
              } ${isSelected ? 'ring-2 ring-indigo-400' : ''
              }`}
          >


            {/* Message content */}
            <div className="relative z-10">
              {/* Reply preview - WhatsApp style */}
              {message.replyTo && (
                <div 
                  onClick={() => onScrollToMessage && onScrollToMessage(message.replyTo.messageId)}
                  className={`mb-2 p-2 rounded-lg border-l-4 cursor-pointer hover:opacity-80 transition-opacity ${
                    isCurrentUser 
                      ? 'bg-white/20 border-white/50 hover:bg-white/30' 
                      : 'bg-gray-100 border-indigo-500 hover:bg-gray-200'
                  }`}>
                  <p className={`text-xs font-semibold ${
                    isCurrentUser ? 'text-white/90' : 'text-indigo-600'
                  }`}>
                    {message.replyTo.senderId === user?.uid ? 'You' : (participantNames[message.replyTo.senderId] || 'Unknown')}
                  </p>
                  <p className={`text-xs mt-1 truncate ${
                    isCurrentUser ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {message.replyTo.media ? '📷 Photo' : message.replyTo.text}
                  </p>
                </div>
              )}
              
              {/* Sender name for group chats - Always show */}
              {isGroupChat && !isCurrentUser && (
                <p className="mb-1 text-xs font-medium text-gray-600">
                  {getSenderName() || 'Unknown User'}
                </p>
              )}

              {message.media ? (
                <MediaMessage
                  media={message.media}
                  isOwn={isCurrentUser}
                  messageText={message.text}
                  onFullscreenOpen={onFullscreenOpen}
                />
              ) : (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.text}
                </p>
              )}
            </div>

            {/* Message reactions display - WhatsApp style */}
            {Object.keys(messageReactions).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-1 mt-2"
              >
                {/* Show top 3 reactions */}
                {Object.entries(messageReactions)
                  .filter(([emoji, users]) => users.length > 0)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .slice(0, 3)
                  .map(([emoji, users]) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowReactionsPopup(true)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer transition-all ${users.includes(user.uid)
                          ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{users.length}</span>
                    </motion.button>
                  ))
                }

                {/* Show +X more if there are more than 3 reactions */}
                {Object.keys(messageReactions).filter(emoji => messageReactions[emoji].length > 0).length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReactionsPopup(true)}
                    className="flex items-center px-2 py-1 text-xs text-white bg-white/20 border border-white/30 rounded-full cursor-pointer hover:bg-white/30"
                  >
                    +{Object.keys(messageReactions).filter(emoji => messageReactions[emoji].length > 0).length - 3}
                  </motion.button>
                )}

              </motion.div>
            )}

            {/* Enhanced Message footer */}
            {showTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex items-center justify-between pt-1 mt-2"
              >
                {/* Time */}
                <span className={`text-xs font-medium ${isCurrentUser ? 'text-white/80' : 'text-gray-500'
                  }`}>
                  {formatTime(message.createdAt)}
                </span>

                {/* Enhanced status indicator */}
                {isCurrentUser && (
                  <MessageStatus 
                    message={message} 
                    contacts={contacts} 
                    currentUserId={user?.uid}
                    activeContact={activeContact}
                  />
                )}
              </motion.div>
            )}

            {/* Reactions Popup - Inside message bubble */}
            <AnimatePresence>
              {showReactionsPopup && (
                <motion.div
                  ref={reactionsPopupRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  className="absolute z-50 mt-2 overflow-hidden transform -translate-x-1/2 border shadow-2xl top-full left-1/2 bg-white/95 backdrop-blur-xl rounded-2xl border-white/50"
                >
                  <ReactionsPopup
                    reactions={messageReactions}
                    participantNames={participantNames}
                    contacts={contacts}
                    user={user}
                    isOpen={showReactionsPopup}
                    onClose={() => setShowReactionsPopup(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Reactions Popup - Positioned like delete popup */}
          <AnimatePresence>
            {showReactionsPopup && (
              <motion.div
                ref={reactionsPopupRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                className="absolute z-40 overflow-hidden transform -translate-x-1/2 border shadow-2xl top-12 left-1/2 bg-white/95 backdrop-blur-xl rounded-2xl border-white/50"
              >
                <ReactionsPopup
                  reactions={messageReactions}
                  participantNames={participantNames}
                  contacts={contacts}
                  user={user}
                  isOpen={showReactionsPopup}
                  onClose={() => setShowReactionsPopup(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji Picker - Positioned relative to this message */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                ref={emojiPickerRef}
                className="absolute z-50 transform -translate-x-1/2 top-12 left-1/2"
              >
                <div className="overflow-hidden border shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl border-white/50">
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
                  <div className="h-80 w-[420px] overflow-y-auto">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji) => handleReaction(emoji.native)}
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
                      perLine={11}
                      emojiSize={24}
                      emojiButtonSize={36}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>



      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '&.MuiSnackbar-root': {
            transition: 'transform 1200ms cubic-bezier(0.2, 0, 0, 1)',
          },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            transition: 'transform 1200ms cubic-bezier(0.2, 0, 0, 1)',
            transform: snackbar.open ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Message;