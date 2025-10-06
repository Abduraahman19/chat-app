// components/Chat/MessageList.js
'use client'
import Message from './Message';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import { FiLoader } from "react-icons/fi";

export const formatGroupDate = (date) => {
  if (!date) return '';

  if (date.toDate) {
    date = date.toDate();
  }

  const jsDate = new Date(date);
  if (isNaN(jsDate.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
  const diffInDays = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  
  // For all older messages, show full date format
  return jsDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: jsDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const getUsernameFromEmail = (email) => {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
};

export default function MessageList({ messages, onDeleteMessage, isLoading }) {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const [initialLoad, setInitialLoad] = useState(true);

  const groupedMessages = messages.reduce((acc, message) => {
    if (message.deletedFor?.includes(user?.uid)) return acc;
    
    const date = formatGroupDate(message.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    setIsAutoScrolling(isNearBottom);
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });
    }
    setIsAutoScrolling(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(initialLoad ? 'auto' : 'smooth');
      if (initialLoad) setInitialLoad(false);
    }, initialLoad ? 100 : 300);

    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (isAutoScrolling) scrollToBottom('auto');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoScrolling]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto bg-gradient-to-br from-indigo-50/30 via-white/50 to-purple-50/30 backdrop-blur-sm"
      style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0V0zm30 30h30v30H30V30z' fill='%23e0e7ff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E')",
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full top-10 right-10 bg-gradient-to-br from-indigo-200/10 to-purple-200/10 blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full bottom-20 left-10 bg-gradient-to-br from-blue-200/10 to-cyan-200/10 blur-2xl"
        />
      </div>

      <div className="relative z-10 flex flex-col px-4 pt-2 pb-4 space-y-2">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex justify-center py-4"
          >
            <div className="flex items-center px-4 py-2 space-x-2 border shadow-lg bg-white/80 backdrop-blur-sm rounded-xl border-white/50">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiLoader className="w-5 h-5 text-indigo-500" />
              </motion.div>
              <span className="text-sm font-medium text-gray-600">Loading messages...</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <motion.div 
              key={date} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="sticky z-20 flex justify-center mb-4 top-2">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative px-4 py-2 overflow-hidden text-sm font-medium text-white border shadow-lg bg-gradient-to-r from-indigo-500/90 to-purple-500/90 rounded-2xl backdrop-blur-xl border-white/20"
                >
                  {/* Shine Effect */}
                  <motion.div
                    animate={{ x: [-50, 100] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                    className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative z-10">{date}</span>
                </motion.div>
              </div>
              
              {dateMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300
                  }}
                  layout
                  className="mb-2"
                >
                  <Message
                    message={message}
                    onDelete={onDeleteMessage}
                    showTime={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-6" />
      </div>

    </div>
  );
}