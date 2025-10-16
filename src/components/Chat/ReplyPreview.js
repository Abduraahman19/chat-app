'use client'
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ReplyPreview({ replyingTo, onCancel, contacts, participantNames }) {
  if (!replyingTo) return null;

  const getSenderName = () => {
    if (replyingTo.senderId === replyingTo.currentUserId) return 'You';
    return participantNames?.[replyingTo.senderId] || 
           contacts?.find(c => c.id === replyingTo.senderId)?.displayName || 
           'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center justify-between p-3 mx-4 mb-2 bg-gray-100 border-l-4 border-indigo-500 rounded-r-lg"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-indigo-600">
          Replying to {getSenderName()}
        </p>
        <p className="text-sm text-gray-600 truncate">
          {replyingTo.media ? '📷 Photo' : replyingTo.text}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 ml-2 text-gray-400 hover:text-gray-600"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
}