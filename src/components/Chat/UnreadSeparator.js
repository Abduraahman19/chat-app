import { motion } from 'framer-motion';

export default function UnreadSeparator({ unreadCount }) {
  if (unreadCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center justify-center my-4"
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-4 py-2 mx-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm"
      >
        {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
      </motion.div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
    </motion.div>
  );
}