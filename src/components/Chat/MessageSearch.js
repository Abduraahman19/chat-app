'use client'
import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const MessageSearch = ({ messages = [], onMessageSelect, isOpen, onClose, chatId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);

  // Reset search when chat changes
  useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, [chatId]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = messages.filter(message => {
      // Search in text
      if (message.text?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // Search in media
      if (message.media) {
        return true; // Show all media messages when searching
      }
      
      return false;
    }).slice(0, 50); // Limit results

    setSearchResults(results);
  }, [searchTerm, messages]);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="px-1 text-yellow-900 bg-yellow-200 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTime = (date) => {
    if (!date) return '';
    if (date.toDate) date = date.toDate();
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="absolute inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="h-full bg-white border-l border-gray-200 shadow-xl w-80"
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Search Messages</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg hover:text-gray-700 hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in messages..."
              className="w-full py-2 pl-10 pr-4 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchTerm && (
            <div className="p-2 text-sm text-gray-500 border-b border-gray-100">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
          )}
          
          <AnimatePresence>
            {searchResults.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onMessageSelect(message)}
                className="p-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              >
                <div className="mb-1 text-sm text-gray-800">
                  {message.media ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">
                        {message.media.type === 'image' ? '📷' : '📄'}
                      </span>
                      <span>{highlightText(message.media.name || 'Media file', searchTerm)}</span>
                    </div>
                  ) : (
                    highlightText(message.text, searchTerm)
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {searchTerm && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages found</p>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default MessageSearch;