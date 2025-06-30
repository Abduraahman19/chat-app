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
                  <button
                    ref={buttonRef}
                    className="mr-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow-sm transition-all duration-200 hover:shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteOptions(!showDeleteOptions);
                    }}
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>

                  {/* Message options dropdown */}
                  <AnimatePresence>
                    {showDeleteOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        ref={menuRef}
                        className="absolute right-full top-0 mr-1 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl z-10 border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={handleCopy}
                          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-100/50 transition-colors duration-150 flex items-center"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                          Copy message
                        </button>
                        <div className="border-t border-gray-200">
                          <button
                            onClick={() => handleDelete(false)}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-100/50 transition-colors duration-150"
                          >
                            Delete for me
                          </button>
                          <button
                            onClick={() => handleDelete(true)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-cyan-100/50 transition-colors duration-150"
                          >
                            Delete for everyone
                          </button>
                        </div>
                        <div className="border-t border-gray-200">
                          <button
                            onClick={() => setShowDeleteOptions(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-cyan-100/50 transition-colors duration-150 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Message bubble */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isCurrentUser
              ? 'bg-[#DEF6C8] text-black rounded-tr-none'
              : 'bg-white text-black rounded-tl-none'
              } shadow-md transition-all duration-200`}
          >
            {/* Message content */}
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

            {/* Message footer with time and status */}
            {showTime && (
              <div
                className={`flex items-center justify-between mt-1 ${isCurrentUser ? 'text-[#a7b6b2]' : 'text-[#a7b6b2]'
                  }`}
              >
                {/* Time on left */}
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>

                {/* Double check on right */}
                {isCurrentUser && (
                  <motion.span
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-1 text-blue-600"
                  >
                    <RiCheckDoubleLine />
                  </motion.span>
                )}
              </div>
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