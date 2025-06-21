'use client'
import Message from '../Chat/Message';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'; // ⬅️ added

export default function MessageList({ messages, onDeleteMessage }) {
  const { user } = useAuth(); // ⬅️ get current user
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {messages
            .filter((message) => !message.deletedFor?.includes(user?.uid)) // ⬅️ hide deleted messages
            .map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Message 
                  message={message} 
                  onDelete={onDeleteMessage}
                />
              </motion.div>
            ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
