'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ProfilePicture from '../ProfilePicture';

export default function GroupMembersModal({ 
  isOpen, 
  onClose, 
  groupData, 
  contacts = [] 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [liveGroupData, setLiveGroupData] = useState(groupData);
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !groupData?.chatId) return;

    const chatRef = doc(db, 'chats', groupData.chatId);
    const unsubscribe = onSnapshot(chatRef, async (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        
        // Fetch current user data for all participants
        const updatedParticipantPhotos = { ...chatData.participantPhotos };
        const updatedParticipantNames = { ...chatData.participantNames };
        
        if (chatData.participants) {
          for (const participantId of chatData.participants) {
            try {
              const userDoc = await getDoc(doc(db, 'users', participantId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                updatedParticipantPhotos[participantId] = userData.photoURL;
                updatedParticipantNames[participantId] = userData.displayName;
              }
            } catch (error) {
              console.error('Error fetching user data:', participantId, error);
            }
          }
        }
        
        setLiveGroupData({ 
          ...chatData, 
          chatId: groupData.chatId,
          participantPhotos: updatedParticipantPhotos,
          participantNames: updatedParticipantNames
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen, groupData?.chatId]);

  if (!isOpen || !liveGroupData) return null;

  const isSuperAdmin = liveGroupData.superAdmin === user?.uid || liveGroupData.createdBy === user?.uid;
  const isAdmin = liveGroupData.admins?.includes(user?.uid) || isSuperAdmin;

  const handleMakeAdmin = async (memberId) => {
    if (!isSuperAdmin) {
      toast.error('Only group creator can make others admin');
      return;
    }

    if (liveGroupData.admins?.includes(memberId)) {
      toast.error('User is already an admin');
      return;
    }

    setIsUpdating(true);
    try {
      const chatRef = doc(db, 'chats', liveGroupData.chatId);
      await updateDoc(chatRef, {
        admins: arrayUnion(memberId)
      });
      toast.success('Member promoted to admin');
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Failed to make admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveAdmin = async (memberId) => {
    if (!isSuperAdmin) {
      toast.error('Only group creator can remove admins');
      return;
    }

    if (memberId === liveGroupData.superAdmin || memberId === liveGroupData.createdBy) {
      toast.error('Cannot remove group creator');
      return;
    }

    setIsUpdating(true);
    try {
      const chatRef = doc(db, 'chats', liveGroupData.chatId);
      await updateDoc(chatRef, {
        admins: arrayRemove(memberId)
      });
      toast.success('Admin removed');
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin) {
      toast.error('Only admins can remove members');
      return;
    }

    if (memberId === liveGroupData.superAdmin) {
      toast.error('Cannot remove super admin');
      return;
    }

    setIsUpdating(true);
    try {
      const chatRef = doc(db, 'chats', liveGroupData.chatId);
      
      // Prepare update data
      const updateData = {
        participants: arrayRemove(memberId),
        [`participantNames.${memberId}`]: null,
        [`participantPhotos.${memberId}`]: null
      };
      
      // Only remove from admins if they are actually an admin
      if (liveGroupData.admins?.includes(memberId)) {
        updateData.admins = arrayRemove(memberId);
      }
      
      await updateDoc(chatRef, updateData);
      toast.success('Member removed from group');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsUpdating(false);
    }
  };

  const getContactInfo = (memberId) => {
    const contact = contacts.find(c => c.id === memberId);
    return {
      name: liveGroupData.participantNames?.[memberId] || contact?.displayName || 'Unknown',
      photoURL: liveGroupData.participantPhotos?.[memberId] || contact?.photoURL
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Group Members</h2>
                <p className="text-sm text-gray-500">{liveGroupData.participants?.length || 0} members</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Members List */}
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {liveGroupData.participants?.map((memberId) => {
                const memberInfo = getContactInfo(memberId);
                const isMemberSuperAdmin = liveGroupData.superAdmin === memberId || liveGroupData.createdBy === memberId;
                const isMemberAdmin = liveGroupData.admins?.includes(memberId) || isMemberSuperAdmin;
                const isCurrentUser = memberId === user?.uid;

                return (
                  <motion.div
                    key={memberId}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <ProfilePicture 
                        user={{ 
                          photoURL: memberInfo.photoURL,
                          displayName: memberInfo.name 
                        }} 
                        size="md" 
                        animate={false}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {memberInfo.name}
                          {isCurrentUser && ' (You)'}
                        </p>
                        <div className="flex items-center space-x-2">
                          {isMemberSuperAdmin ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <span className="mr-1">👑</span>
                              Super Admin
                            </span>
                          ) : isMemberAdmin ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Member</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {!isCurrentUser && (
                      <div className="flex items-center space-x-2">
                        {/* Make/Remove Admin - Only Super Admin can do this */}
                        {isSuperAdmin && !isMemberSuperAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isMemberAdmin ? handleRemoveAdmin(memberId) : handleMakeAdmin(memberId)}
                            disabled={isUpdating}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isMemberAdmin
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            {isMemberAdmin ? 'Remove Admin' : 'Make Admin'}
                          </motion.button>
                        )}

                        {/* Remove Member - Any Admin can do this except Super Admin */}
                        {isAdmin && !isMemberSuperAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveMember(memberId)}
                            disabled={isUpdating}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            Remove
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}