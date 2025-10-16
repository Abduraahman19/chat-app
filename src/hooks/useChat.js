import { useState, useEffect } from 'react';
import { db, auth } from '../utils/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';

export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = async (text, media = null, replyTo = null) => {
    if (!chatId || (!text.trim() && !media)) return;

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to send messages");
      }

      // Check if chat exists
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        console.error('Chat document not found:', chatId);
        throw new Error("Chat does not exist. Please refresh and try again.");
      }

      const chatData = chatDoc.data();
      if (!chatData.participants || !chatData.participants.includes(auth.currentUser.uid)) {
        throw new Error("You're not a participant in this chat");
      }

      const timestamp = new Date();
      const otherParticipants = chatData.participants.filter(id => id !== auth.currentUser.uid);
      
      const messageData = {
        text: text || '',
        chatId,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        timestamp: timestamp.getTime(),
        readBy: { [auth.currentUser.uid]: serverTimestamp() },
        deliveredTo: { [auth.currentUser.uid]: serverTimestamp() },
        status: 'sent'
      };

      // Add reply data if replying to a message
      if (replyTo) {
        messageData.replyTo = {
          messageId: replyTo.id,
          text: replyTo.text || '',
          senderId: replyTo.senderId
        };
        
        // Only add media if it exists
        if (replyTo.media) {
          messageData.replyTo.media = replyTo.media;
        }
      }

      if (media) {
        messageData.media = media;
      }
      
      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update chat with last message and unread counts
      const lastMessageText = media 
        ? `📎 ${media.type === 'image' ? 'Photo' : media.type === 'video' ? 'Video' : 'File'}` 
        : text;
      
      const unreadUpdates = {};
      otherParticipants.forEach(participantId => {
        unreadUpdates[`unreadCount.${participantId}`] = increment(1);
      });
        
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: lastMessageText,
        lastMessageAt: serverTimestamp(),
        lastMessageId: messageRef.id,
        lastMessageSenderId: auth.currentUser.uid,
        ...unreadUpdates
      });

      // Mark as delivered for online users
      setTimeout(() => markAsDelivered(messageRef.id), 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      throw error;
    }
  };

  const markAsRead = async (messageId) => {
    if (!auth.currentUser || !messageId) return;
    
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        [`readBy.${auth.currentUser.uid}`]: serverTimestamp(),
        status: 'read'
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAsDelivered = async (messageId) => {
    if (!auth.currentUser || !messageId) return;
    
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        [`deliveredTo.${auth.currentUser.uid}`]: serverTimestamp(),
        status: 'delivered'
      });
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  };

  const markChatAsRead = async () => {
    if (!chatId || !auth.currentUser) return;
    
    try {
      // Reset unread count for current user
      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${auth.currentUser.uid}`]: 0,
        [`lastSeen.${auth.currentUser.uid}`]: serverTimestamp()
      });
      
      // Mark all unread messages as read
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== auth.currentUser.uid && 
        !msg.readBy?.[auth.currentUser.uid]
      );
      
      const readPromises = unreadMessages.map(msg => markAsRead(msg.id));
      await Promise.all(readPromises);
      
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const messagesData = [];
        let unreadCounter = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const messageData = { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            timestamp: data.timestamp || data.createdAt?.toMillis() || Date.now()
          };
          
          // Count unread messages
          if (data.senderId !== auth.currentUser?.uid && !data.readBy?.[auth.currentUser?.uid]) {
            unreadCounter++;
          }
          
          messagesData.push(messageData);
        });
        
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesData);
        setUnreadCount(unreadCounter);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Messages error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Auto-mark chat as read when messages are viewed
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const timer = setTimeout(() => {
        markChatAsRead();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, loading]);

  return { 
    messages, 
    sendMessage, 
    loading, 
    error, 
    unreadCount,
    markAsRead,
    markAsDelivered,
    markChatAsRead
  };
}