'use client'
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EllipsisVerticalIcon, TrashIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaTimes } from "react-icons/fa";

export default function ChatOptionsMenu({ 
  selectedMessages = [], 
  onClearChat, 
  onDeleteSelected, 
  onForwardSelected,
  onClearSelection 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const optionsRef = useRef(null);

  const handleClearChat = () => {
    onClearChat();
    setIsOpen(false);
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.length > 0) {
      onDeleteSelected(selectedMessages);
      setIsOpen(false);
    }
  };

  const handleForwardSelected = () => {
    if (selectedMessages.length > 0) {
      onForwardSelected(selectedMessages);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && optionsRef.current && !optionsRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`relative rounded-xl p-2 transition-all duration-300 border border-transparent overflow-hidden flex items-center justify-center w-10 h-10 ${
          isOpen 
            ? 'bg-gradient-to-r from-gray-100 to-gray-100 border-gray-300 shadow-lg' 
            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-50 hover:border-gray-200 text-gray-600'
        }`}
        aria-label="Chat options"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        <motion.div
          animate={isOpen ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isOpen ? Infinity : 0, repeatDelay: 2 }}
          className="relative z-10"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </motion.div>
        
        {isOpen && (
          <motion.div
            animate={{ x: [-20, 40] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={optionsRef}
            className="absolute bottom-24 left-4 z-10"
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 hide-scrollbar">
              <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-700">Options</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
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
                          setIsOpen(false);
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
                    onClick={handleClearChat}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Clear Chat</span>
                  </button>

                  {selectedMessages.length > 0 && (
                    <>
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-left text-red-600 transition-colors hover:bg-red-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span>Delete Selected ({selectedMessages.length})</span>
                      </button>

                      <button
                        onClick={handleForwardSelected}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-left text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <ArrowRightIcon className="w-5 h-5" />
                        <span>Forward Selected ({selectedMessages.length})</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}