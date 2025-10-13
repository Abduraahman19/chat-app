'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import UnifiedSidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import ProfilePicture from '../components/ProfilePicture';
import TypingIndicator from '../components/Chat/TypingIndicator';
import MessageSearch from '../components/Chat/MessageSearch';
import { doc, deleteDoc, updateDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FiUsers, FiCamera } from 'react-icons/fi';
import GroupPhotoUpload from '../components/Chat/GroupPhotoUpload';
import ChatOptionsMenu from '../components/Chat/ChatOptionsMenu';
import ForwardModal from '../components/Chat/ForwardModal';
import GroupMembersModal from '../components/Chat/GroupMembersModal';

import PageLoader from '../components/Layout/PageLoader';

export default function Chat() {
  const { user, setUser, loading, contacts } = useAuth();
  const router = useRouter();
  const [activeContact, setActiveContact] = useState(null);
  const [lastSeen, setLastSeen] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupPhotoUpload, setShowGroupPhotoUpload] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const [showAdminSelectionModal, setShowAdminSelectionModal] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState(null);
  const chatId = activeContact ? 
    (activeContact.isGroup ? activeContact.chatId : [user?.uid, activeContact?.id].sort().join('_')) 
    : null;
  const { messages, sendMessage, unreadCount, markChatAsRead } = useChat(chatId);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Auto-mark chat as read when chat is opened
  useEffect(() => {
    if (activeContact && !loading) {
      const timer = setTimeout(() => {
        markChatAsRead();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeContact, loading, markChatAsRead]);

  // Track active contact's status and typing
  useEffect(() => {
    if (!activeContact?.id || !chatId) return;

    const userRef = doc(db, 'users', activeContact.id);
    const chatRef = doc(db, 'chats', chatId);
    
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLastSeen(prev => ({
          ...prev,
          [activeContact.id]: data.lastSeen || 'offline'
        }));
      }
    });

    const unsubscribeChat = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const typing = data.typing || {};
        
        // Get typing users (exclude current user)
        const typingUserIds = Object.keys(typing).filter(uid => 
          uid !== user?.uid && typing[uid] && 
          (new Date() - typing[uid].toDate()) < 3000 // 3 seconds threshold
        );
        
        // Get display names for typing users
        const typingNames = typingUserIds.map(uid => {
          if (activeContact.isGroup) {
            // For groups, get name from participantNames or contacts list
            const participantName = activeContact.participantNames?.[uid];
            if (participantName) return participantName;
            
            // Fallback to contacts list
            const contact = contacts.find(c => c.id === uid);
            if (contact) {
              return contact.displayName || contact.email.split('@')[0];
            }
            
            return 'Someone';
          } else {
            // For individual chats
            if (uid === activeContact.id) {
              return activeContact.displayName || activeContact.email.split('@')[0];
            }
            return 'Someone';
          }
        });
        
        setTypingUsers(typingNames);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeChat();
    };
  }, [activeContact, chatId, user?.uid]);

  const isOnline = (contactId) => {
    if (!contactId) return false;
    const timestamp = lastSeen[contactId];
    if (!timestamp || timestamp === 'offline') return false;

    const lastSeenDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    return (now - lastSeenDate) < 300000; // 5 minutes threshold
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp || timestamp === 'offline') return 'Offline';

    try {
      const lastSeenDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(lastSeenDate.getTime())) return 'Offline';

      const now = new Date();
      const diffSeconds = Math.floor((now - lastSeenDate) / 1000);

      // If online now (within 5 minutes)
      if (diffSeconds < 300) return 'Online';

      const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };

      // Today
      if (lastSeenDate.toDateString() === now.toDateString()) {
        return `Last seen today at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastSeenDate.toDateString() === yesterday.toDateString()) {
        return `Last seen yesterday at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Within last 7 days
      if (diffSeconds < 604800) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Last seen on ${days[lastSeenDate.getDay()]} at ${lastSeenDate.toLocaleTimeString([], options)}`;
      }

      // Older than 7 days
      return `Last seen on ${lastSeenDate.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })} at ${lastSeenDate.toLocaleTimeString([], options)}`;
    } catch (error) {
      console.error('Error formatting last seen:', error);
      return 'Offline';
    }
  };


  const handleDeleteMessage = async (messageId, deleteForEveryone) => {
    if (!user) return;

    try {
      if (deleteForEveryone) {
        // Delete for everyone - remove from messages collection
        await deleteDoc(doc(db, 'messages', messageId));
        toast.success('Message deleted for everyone');
      } else {
        // Delete for me - add to user's deletedMessages array
        const userRef = doc(db, 'users', user.uid);
        const currentDeletedMessages = user.deletedMessages || [];
        const updatedDeletedMessages = [...currentDeletedMessages, messageId];
        
        // Update Firestore
        await updateDoc(userRef, {
          deletedMessages: updatedDeletedMessages
        });
        
        // Update local user state immediately
        setUser(prev => ({
          ...prev,
          deletedMessages: updatedDeletedMessages
        }));
        
        toast.success('Message deleted for you');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleClearChat = async () => {
    if (!user || !chatId) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const messagesToDelete = messages.map(msg => msg.id);
      const currentDeletedMessages = user.deletedMessages || [];
      const updatedDeletedMessages = [...currentDeletedMessages, ...messagesToDelete];
      
      await updateDoc(userRef, {
        deletedMessages: updatedDeletedMessages
      });
      
      setUser(prev => ({
        ...prev,
        deletedMessages: updatedDeletedMessages
      }));
      
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const handleDeleteSelected = async (messageIds) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const currentDeletedMessages = user.deletedMessages || [];
      const updatedDeletedMessages = [...currentDeletedMessages, ...messageIds];
      
      await updateDoc(userRef, {
        deletedMessages: updatedDeletedMessages
      });
      
      setUser(prev => ({
        ...prev,
        deletedMessages: updatedDeletedMessages
      }));
      
      setSelectedMessages([]);
      setSelectionMode(false);
      toast.success(`${messageIds.length} messages deleted`);
    } catch (error) {
      console.error('Error deleting selected messages:', error);
      toast.error('Failed to delete messages');
    }
  };

  const handleForwardSelected = (messageIds) => {
    setShowForwardModal(true);
  };

  const handleClearSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false);
  };

  const handleMessageSelect = (messageId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedMessages([messageId]);
    } else {
      setSelectedMessages(prev => 
        prev.includes(messageId)
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
    }
  };

  const handleForwardMessages = async (messagesToForward, selectedContacts) => {
    try {
      // Import necessary functions for sending messages to different chats
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      
      for (const contact of selectedContacts) {
        const forwardChatId = contact.isGroup 
          ? contact.chatId 
          : [user.uid, contact.id].sort().join('_');
        
        for (const message of messagesToForward) {
          // Send message to the specific chat
          await addDoc(collection(db, 'messages'), {
            text: message.text || '',
            media: message.media || null,
            senderId: user.uid,
            chatId: forwardChatId,
            createdAt: serverTimestamp(),
            reactions: {}
          });
        }
      }
      
      setSelectedMessages([]);
      setSelectionMode(false);
      toast.success(`Messages forwarded to ${selectedContacts.length} contact(s)`);
    } catch (error) {
      console.error('Error forwarding messages:', error);
      toast.error('Failed to forward messages');
    }
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedMessages([]);
    }
  };

  const handleShowGroupInfo = () => {
    setShowGroupMembersModal(true);
  };

  const handleLeaveGroup = async () => {
    if (!activeContact?.isGroup || !user) return;
    
    // Get current group data to check if user is admin
    const chatDoc = await getDoc(doc(db, 'chats', activeContact.chatId));
    if (!chatDoc.exists()) return;
    
    const groupData = chatDoc.data();
    const isAdmin = (groupData.admins || []).includes(user.uid);
    
    if (isAdmin) {
      // Show admin selection modal
      setShowAdminSelectionModal(true);
    } else {
      // Regular member can leave directly
      await executeLeaveGroup(null);
    }
  };

  const executeLeaveGroup = async (newAdminId) => {
    if (!activeContact?.isGroup || !user) return;
    
    try {
      const { updateDoc, arrayRemove, deleteDoc } = await import('firebase/firestore');
      const chatRef = doc(db, 'chats', activeContact.chatId);
      
      // Get current group data
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        toast.error('Group not found');
        setActiveContact(null);
        return;
      }
      
      const groupData = chatDoc.data();
      const participants = groupData.participants || [];
      const updatedParticipants = participants.filter(id => id !== user.uid);
      
      if (updatedParticipants.length === 0) {
        // If no participants left, delete the group
        await deleteDoc(chatRef);
        toast.success('Group deleted successfully');
      } else {
        // Remove user from participants and admins
        let updateData = {
          participants: updatedParticipants,
          [`participantNames.${user.uid}`]: null,
          [`participantPhotos.${user.uid}`]: null
        };
        
        // Only update admins if user is actually an admin
        if (groupData.admins?.includes(user.uid)) {
          updateData.admins = (groupData.admins || []).filter(id => id !== user.uid);
          
          // If user selected a new admin, promote them
          if (newAdminId) {
            updateData.superAdmin = newAdminId;
            updateData.createdBy = newAdminId;
            
            // Ensure new admin is in admins array
            if (!updateData.admins.includes(newAdminId)) {
              updateData.admins.push(newAdminId);
            }
          }
        }
        
        await updateDoc(chatRef, updateData);
        toast.success('Left group successfully');
      }
      
      // Close the chat and modal
      setActiveContact(null);
      setShowAdminSelectionModal(false);
      setSelectedNewAdmin(null);
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <UnifiedSidebar
          activeContact={activeContact}
          setActiveContact={setActiveContact}
        />

        <div className="flex flex-col flex-1 min-w-0 bg-sky-50">
          {activeContact ? (
            <>
              <div className="relative p-6 overflow-hidden border-b border-gray-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -10, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-8 h-8 rounded-full top-2 right-5 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-xl"
                  />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <ProfilePicture 
                        user={{
                          ...activeContact,
                          photoURL: activeContact.isGroup ? activeContact.groupPhoto : activeContact.photoURL
                        }} 
                        size="lg" 
                        showOnlineStatus={!activeContact.isGroup}
                        isOnline={isOnline(activeContact.id)}
                      />
                      {/* Group photo edit button for admins */}
                      {activeContact.isGroup && activeContact.isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowGroupPhotoUpload(true)}
                          className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600"
                          title="Change group photo"
                        >
                          <FiCamera size={12} />
                        </motion.button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center text-xl font-bold text-transparent truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
                      >
                        {activeContact.isGroup && (
                          <FiUsers className="mr-2 text-green-600" size={20} />
                        )}
                        {activeContact.isGroup 
                          ? activeContact.displayName 
                          : (activeContact.displayName || activeContact.email.split('@')[0])}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center mt-1 space-x-2"
                      >
                        {activeContact.isGroup ? (
                          <>
                            <FiUsers size={12} className="text-green-600" />
                            <p className="text-sm text-green-600">
                              {activeContact.participants?.length || 0} members
                              {activeContact.isAdmin && ' • You are admin'}
                            </p>
                          </>
                        ) : isOnline(activeContact.id) ? (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <p className="text-sm font-medium text-green-600">Online</p>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            <p className="text-sm text-gray-500">
                              {formatLastSeen(lastSeen[activeContact.id])}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 z-[9999]">
                    {/* Search Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSearch(!showSearch)}
                      className="p-2 text-gray-500 transition-all duration-200 border border-transparent rounded-xl hover:text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                      aria-label="Search messages"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </motion.button>



                    {/* Close Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveContact(null)}
                      className="p-2 text-gray-500 transition-all duration-200 border border-transparent rounded-xl hover:text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                      aria-label="Close chat"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col flex-1 min-h-0">
                <MessageList
                  messages={messages.filter(msg =>
                    !user?.deletedMessages?.includes(msg.id)
                  )}
                  onDeleteMessage={handleDeleteMessage}
                  contacts={[...contacts, { id: user?.uid, ...user }]}
                  activeContact={activeContact}
                  highlightedMessageId={highlightedMessageId}
                  onScrollToMessage={(messageId) => setHighlightedMessageId(messageId)}
                  selectedMessages={selectedMessages}
                  onMessageSelect={handleMessageSelect}
                  selectionMode={selectionMode}
                />
                
                <TypingIndicator typingUsers={typingUsers} />
                
                <ChatInput
                  sendMessage={sendMessage}
                  onNewContact={() => setActiveContact(null)}
                  chatId={chatId}
                  activeContact={activeContact}
                  selectedMessages={selectedMessages}
                  onClearChat={handleClearChat}
                  onDeleteSelected={handleDeleteSelected}
                  onForwardSelected={handleForwardSelected}
                  onClearSelection={handleClearSelection}
                  onToggleSelectionMode={handleToggleSelectionMode}
                  onLeaveGroup={handleLeaveGroup}
                  onShowGroupInfo={handleShowGroupInfo}
                />
                
                {/* Message Search Overlay */}
                {showSearch && (
                  <MessageSearch
                    key={chatId}
                    messages={messages.filter(msg => !user?.deletedMessages?.includes(msg.id))}
                    chatId={chatId}
                    onMessageSelect={(message) => {
                      setHighlightedMessageId(message.id);
                      setShowSearch(false);
                      // Clear highlight after 3 seconds
                      setTimeout(() => setHighlightedMessageId(null), 3000);
                    }}
                    isOpen={showSearch}
                    onClose={() => setShowSearch(false)}
                  />
                )}
              </div>
              
              {/* Group Photo Upload Modal */}
              {showGroupPhotoUpload && activeContact.isGroup && activeContact.isAdmin && (
                <GroupPhotoUpload
                  groupId={activeContact.chatId}
                  currentPhoto={activeContact.groupPhoto || activeContact.photoURL}
                  isAdmin={activeContact.isAdmin}
                  onClose={() => setShowGroupPhotoUpload(false)}
                  onPhotoUpdate={(newPhoto) => {
                    setActiveContact(prev => ({ 
                      ...prev, 
                      photoURL: newPhoto,
                      groupPhoto: newPhoto 
                    }));
                  }}
                />
              )}

              {/* Forward Modal */}
              {showForwardModal && (
                <ForwardModal
                  isOpen={showForwardModal}
                  onClose={() => setShowForwardModal(false)}
                  contacts={contacts.filter(contact => contact.id !== activeContact?.id)}
                  messages={messages.filter(msg => selectedMessages.includes(msg.id))}
                  onForward={handleForwardMessages}
                />
              )}

              {/* Group Members Modal */}
              {showGroupMembersModal && activeContact?.isGroup && (
                <GroupMembersModal
                  isOpen={showGroupMembersModal}
                  onClose={() => setShowGroupMembersModal(false)}
                  groupData={activeContact}
                  contacts={contacts}
                />
              )}

              {/* Admin Selection Modal */}
              {showAdminSelectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl p-6 w-96 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Select New Admin</h3>
                    <p className="text-sm text-gray-600 mb-4">Choose who will be the new admin before leaving:</p>
                    
                    <div className="space-y-2 mb-6">
                      {activeContact?.participants?.filter(id => id !== user.uid).map(participantId => {
                        const contact = contacts.find(c => c.id === participantId);
                        const displayName = activeContact.participantNames?.[participantId] || contact?.displayName || 'Unknown';
                        
                        return (
                          <div
                            key={participantId}
                            onClick={() => setSelectedNewAdmin(participantId)}
                            className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                              selectedNewAdmin === participantId
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {displayName[0].toUpperCase()}
                              </div>
                              <span className="font-medium">{displayName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowAdminSelectionModal(false);
                          setSelectedNewAdmin(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => executeLeaveGroup(selectedNewAdmin)}
                        disabled={!selectedNewAdmin}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Leave Group
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg p-8 text-center transition-shadow duration-300 border border-indigo-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-2xl"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="flex items-center justify-center w-24 h-24 mx-auto mb-6 border-4 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 border-white/50"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </motion.svg>
                  <motion.div
                    animate={{ x: [-40, 80] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-0 skew-x-12 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text"
                >
                  Start a Conversation
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 text-lg leading-relaxed text-gray-600"
                >
                  Select a contact from your list to start chatting and connect with your friends
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center space-x-4 text-sm text-gray-500"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Secure messaging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Real-time chat</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}