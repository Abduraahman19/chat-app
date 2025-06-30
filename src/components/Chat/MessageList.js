// components/Chat/MessageList.js
'use client'
import Message from './Message';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BsChevronDoubleDown } from "react-icons/bs";
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
  const [showScrollButton, setShowScrollButton] = useState(false);
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
    setShowScrollButton(!isNearBottom);
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
      className="flex-1 overflow-y-auto bg-[#e5ddd5] relative"
      style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z' fill='%23dfdbd5' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E')",
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      <div className="flex flex-col space-y-1 px-2 pb-2 pt-1">
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-2">
            <FiLoader className="animate-spin text-gray-500 h-5 w-5" />
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="relative">
              <div className="sticky top-2 z-10 flex justify-center mb-2">
                <div className="bg-black/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                  {date}
                </div>
              </div>
              
              {dateMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <Message
                    message={message}
                    onDelete={onDeleteMessage}
                    showTime={true}
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-44 right-6 w-10 h-10 bg-white/90 text-gray-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200/50 z-10"
            aria-label="Scroll to bottom"
          >
            <BsChevronDoubleDown className="text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}