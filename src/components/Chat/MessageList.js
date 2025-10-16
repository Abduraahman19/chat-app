// components/Chat/MessageList.js
'use client'
import Message from './Message';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
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

export default function MessageList({ messages, onDeleteMessage, isLoading, contacts = [], activeContact = null, highlightedMessageId = null, onScrollToMessage, selectedMessages = [], onMessageSelect, selectionMode = false, onFullscreenOpen, onReply, onStar }) {
  const { user } = useAuth();
  const [visibleMessages, setVisibleMessages] = useState(new Set());
  const observerRef = useRef(null);
  
  // Helper function to get sender info
  const getSenderInfo = (senderId) => {
    if (senderId === user?.uid) return user;
    
    // For group chats, try to get info from participants first
    if (activeContact?.isGroup && activeContact?.participantNames) {
      const participantName = activeContact.participantNames[senderId];
      if (participantName) {
        // Try to find full contact info
        const fullContact = contacts.find(contact => contact.id === senderId);
        if (fullContact) return fullContact;
        
        // Return basic info with participant name
        return {
          id: senderId,
          displayName: participantName,
          photoURL: null // Will show initials
        };
      }
    }
    
    return contacts.find(contact => contact.id === senderId) || {
      id: senderId,
      displayName: 'Unknown User',
      photoURL: null
    };
  };
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const messageRefs = useRef({});
  const lastMessageCountRef = useRef(0);
  const [initialLoad, setInitialLoad] = useState(true);

  // Intersection Observer for marking messages as read
  useEffect(() => {
    if (!user?.uid) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const senderId = entry.target.dataset.senderId;
            
            // Only mark as read if it's not our own message
            if (messageId && senderId !== user.uid) {
              setVisibleMessages(prev => new Set([...prev, messageId]));
            }
          }
        });
      },
      {
        threshold: 0.5, // Message is 50% visible
        rootMargin: '0px 0px -50px 0px' // Trigger when message is well within view
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [user?.uid]);

  // Mark visible messages as read
  useEffect(() => {
    if (visibleMessages.size === 0) return;

    const markMessagesAsRead = async () => {
      const messagesToMark = Array.from(visibleMessages);
      
      for (const messageId of messagesToMark) {
        try {
          await updateDoc(doc(db, 'messages', messageId), {
            [`readBy.${user.uid}`]: serverTimestamp(),
            status: 'read'
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
      
      // Clear the set after marking
      setVisibleMessages(new Set());
    };

    const timer = setTimeout(markMessagesAsRead, 1000); // Delay to avoid too frequent updates
    return () => clearTimeout(timer);
  }, [visibleMessages, user?.uid]);

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

  // Auto-scroll for new messages (WhatsApp behavior)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const newMessages = messages.slice(lastMessageCountRef.current);
      const hasNewFromOthers = newMessages.some(msg => msg.senderId !== user?.uid);
      
      if (isAutoScrolling) {
        // Auto-scroll if user is at bottom
        scrollToBottom('smooth');
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isAutoScrolling, user?.uid]);

  // Auto-scroll when opening new chat
  useEffect(() => {
    if (activeContact) {
      const timer = setTimeout(() => {
        scrollToBottom('auto');
        setIsAutoScrolling(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeContact]);

  useEffect(() => {
    if (initialLoad) setInitialLoad(false);
  }, [messages]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      setTimeout(() => {
        messageRefs.current[highlightedMessageId].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [highlightedMessageId]);

  // Handle scroll to message from reply click
  const handleScrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      
      // Highlight the message temporarily
      if (onScrollToMessage) {
        onScrollToMessage(messageId);
        // Auto-remove highlight after 2 seconds
        setTimeout(() => {
          onScrollToMessage(null);
        }, 2000);
      }
    }
  };



  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-indigo-50/30 via-white/50 to-purple-50/30 backdrop-blur-sm"
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
                  className="mb-2"
                >
                  <div
                    ref={(el) => {
                      if (el) {
                        messageRefs.current[message.id] = el;
                        // Add to intersection observer
                        if (observerRef.current) {
                          el.dataset.messageId = message.id;
                          el.dataset.senderId = message.senderId;
                          observerRef.current.observe(el);
                        }
                      }
                    }}
                    className={`transition-all duration-500 ${
                      highlightedMessageId === message.id 
                        ? 'bg-gray-100/50 border-2 border-gray-300/50 rounded-lg p-2 shadow-lg backdrop-blur-sm' 
                        : ''
                    }`}
                  >
                    <Message
                      message={message}
                      onDelete={onDeleteMessage}
                      showTime={true}
                      senderInfo={getSenderInfo(message.senderId)}
                      isGroupChat={activeContact?.isGroup || false}
                      participantNames={activeContact?.participantNames || {}}
                      contacts={contacts}
                      isSelected={selectedMessages.includes(message.id)}
                      onSelect={onMessageSelect}
                      selectionMode={selectionMode}
                      activeContact={activeContact}
                      onFullscreenOpen={onFullscreenOpen}
                      onReply={onReply}
                      onStar={onStar}
                      onScrollToMessage={handleScrollToMessage}
                    />
                  </div>
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