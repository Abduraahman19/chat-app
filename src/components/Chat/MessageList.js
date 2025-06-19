// src/components/Chat/MessageList.js
'use client'

import Message from './Message';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Message message={message} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}