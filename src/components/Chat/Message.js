'use client'
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RiCheckDoubleLine } from "react-icons/ri";
import { EllipsisVerticalIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';
import { Slide } from '@mui/material';

const Message = ({ message, onDelete, showTime = false }) => {
  const { user } = useAuth();
  const isCurrentUser = message.senderId === user?.uid;
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)) {
        setShowMenu(false);
        setShowDeleteOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Format time for message footer
  const formatTime = (date) => {
    if (!date) return '';
    if (date.toDate) date = date.toDate();
    const jsDate = new Date(date);
    return jsDate.toLocaleTimeString([], {
      hour: '2-digit',
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
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} px-4 py-1 relative group`}
        onMouseEnter={() => isCurrentUser && setShowMenu(true)}
        onMouseLeave={() => {
          if (!showDeleteOptions) {
            setShowMenu(false);
          }
        }}
      >
        <div className="flex items-center">
          {/* Message options menu (three dots) */}
          {isCurrentUser && (
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

                  {/* Message options dropdown */}
                  <AnimatePresence>
                    {showDeleteOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                        ref={menuRef}
                        className="absolute top-0 z-20 mr-2 overflow-hidden border shadow-2xl right-full w-52 bg-white/95 backdrop-blur-xl rounded-2xl border-white/50"
                      >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50" />
                        
                        <div className="relative z-10">
                          <motion.button
                            whileHover={{ x: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCopy}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-left text-gray-700 transition-all duration-200 border-b hover:bg-indigo-50 border-gray-100/50"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4 mr-3 text-indigo-500" />
                            Copy message
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
          )}

          {/* Enhanced Message bubble */}
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm border shadow-lg transition-all duration-300 overflow-hidden ${
              isCurrentUser
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-md border-indigo-300/30'
                : 'bg-white/90 text-gray-800 rounded-tl-md border-gray-200/50'
            }`}
          >
            {/* Shine Effect for sent messages */}
            {isCurrentUser && (
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 8 }}
                className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
            
            {/* Message content */}
            <p className="relative z-10 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>

            {/* Enhanced Message footer */}
            {showTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex items-center justify-between pt-1 mt-2"
              >
                {/* Time */}
                <span className={`text-xs font-medium ${
                  isCurrentUser ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </span>

                {/* Enhanced status indicator */}
                {isCurrentUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    className="flex items-center ml-2"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                      className="text-white/90"
                    >
                      <RiCheckDoubleLine className="text-sm" />
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
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