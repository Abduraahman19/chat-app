'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProfilePicture from '../ProfilePicture';

const ReactionsPopup = ({ reactions, participantNames, contacts, user, isOpen, onClose }) => {
  if (!isOpen || !reactions || Object.keys(reactions).length === 0) return null;

  // Get user info by ID
  const getUserInfo = (userId) => {
    if (userId === user?.uid) return user;
    const contact = contacts.find(c => c.id === userId);
    if (contact) return contact;
    
    return {
      id: userId,
      displayName: participantNames?.[userId] || 'Unknown User',
      photoURL: null
    };
  };

  // Flatten reactions for display
  const flattenedReactions = [];
  Object.entries(reactions).forEach(([emoji, userIds]) => {
    userIds.forEach(userId => {
      const userInfo = getUserInfo(userId);
      flattenedReactions.push({
        emoji,
        userId,
        userInfo
      });
    });
  });

  // Group by emoji for tabs
  const reactionTabs = Object.entries(reactions).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    users: userIds.map(userId => getUserInfo(userId))
  }));

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      className="bg-white/95 backdrop-blur-xl -right-60 rounded-2xl shadow-2xl border border-white/50 w-72  max-h-[60vh] overflow-hidden"
    >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800">Reactions</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-200"
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Reaction Tabs */}
          <div className="flex px-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-600">
              All ({flattenedReactions.length})
            </div>
            {reactionTabs.map(({ emoji, count }) => (
              <div key={emoji} className="flex items-center px-2 py-1.5 text-xs">
                <span className="mr-1">{emoji}</span>
                <span className="text-gray-600">{count}</span>
              </div>
            ))}
          </div>

          {/* Reactions List */}
          <div className="overflow-y-auto max-h-64">
            {flattenedReactions.map(({ emoji, userId, userInfo }, index) => (
              <motion.div
                key={`${userId}-${emoji}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  {userInfo.photoURL ? (
                    <ProfilePicture user={userInfo} size="sm" animate={false} />
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                      {(userInfo.displayName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {userInfo.displayName || userInfo.email?.split('@')[0] || 'Unknown User'}
                    </p>
                    {userId === user?.uid && (
                      <p className="text-xs text-gray-500">You</p>
                    )}
                  </div>
                </div>
                <div className="text-xl">{emoji}</div>
              </motion.div>
            ))}
          </div>
    </motion.div>
  );
};

export default ReactionsPopup;