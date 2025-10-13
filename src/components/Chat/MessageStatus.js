import { motion } from 'framer-motion';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

export default function MessageStatus({ message, contacts, currentUserId, activeContact }) {
  if (message.senderId !== currentUserId) return null;

  // Get recipient info
  const getRecipientStatus = () => {
    if (activeContact?.isGroup) {
      // For groups, check if any participant has read
      const participants = activeContact.participants?.filter(id => id !== currentUserId) || [];
      let hasRead = false;
      let hasOnlineUser = false;
      
      participants.forEach(participantId => {
        if (message.readBy?.[participantId]) hasRead = true;
        
        // Check if participant is online (from contacts list)
        const contact = contacts.find(c => c.id === participantId);
        if (contact?.isOnline) hasOnlineUser = true;
      });
      
      return { hasRead, hasOnlineUser };
    } else {
      // For individual chats
      const recipientId = activeContact?.id;
      const hasRead = message.readBy?.[recipientId];
      const recipient = contacts.find(c => c.id === recipientId);
      const hasOnlineUser = recipient?.isOnline || false;
      
      return { hasRead, hasOnlineUser };
    }
  };

  const getStatusIcon = () => {
    const { hasRead, hasOnlineUser } = getRecipientStatus();
    
    // Read - Blue double tick (opened chat and read message)
    if (hasRead) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative text-blue-400"
        >
          <FiCheck size={12} className="absolute" style={{ transform: 'translateX(-3px)' }} />
          <FiCheck size={12} className="relative" style={{ transform: 'translateX(3px)' }} />
        </motion.div>
      );
    }
    
    // Delivered - White double tick (user is online/app open)
    if (hasOnlineUser) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative text-white/70"
        >
          <FiCheck size={12} className="absolute" style={{ transform: 'translateX(-3px)' }} />
          <FiCheck size={12} className="relative" style={{ transform: 'translateX(3px)' }} />
        </motion.div>
      );
    }
    
    // Sent - Single white tick (user offline/app not open)
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-white/70"
      >
        <FiCheck size={12} />
      </motion.div>
    );
  };



  return (
    <div className="flex items-center ml-2">
      {getStatusIcon()}
    </div>
  );
}