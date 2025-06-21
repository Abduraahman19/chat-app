import { useState, useEffect } from 'react';
import { db, auth } from '../utils/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot, // Make sure this is imported
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sendMessage = async (text) => {
    if (!chatId || !text.trim()) return;

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to send messages");
      }

      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        throw new Error("Chat does not exist");
      }

      if (!chatDoc.data().participants.includes(auth.currentUser.uid)) {
        throw new Error("You're not a participant in this chat");
      }

      // Add client-side timestamp
      const timestamp = new Date();
      
      await addDoc(collection(db, 'messages'), {
        text,
        chatId,
        senderId: auth.currentUser.uid,
        createdAt: timestamp,
        timestamp: timestamp.getTime() // For client-side sorting
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageAt: timestamp
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      throw error;
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
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            timestamp: data.timestamp || data.createdAt?.toMillis() || Date.now()
          });
        });
        
        // Client-side sorting
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesData);
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

  return { messages, sendMessage, loading, error };
}