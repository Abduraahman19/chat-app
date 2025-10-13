'use client'
import { motion } from 'framer-motion';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing...`;
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center px-4 py-1 text-sm text-gray-500 bg-gray-50 border-t border-gray-100"
    >
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          ))}
        </div>
        <span>{getTypingText()}</span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;