// src/hooks/useChat.js
import { useState, useEffect } from 'react';
import { db, auth } from '../utils/firebase'; // Make sure auth is imported
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  const sendMessage = async (text) => {
    if (!chatId || !text.trim()) return;

    try {
      // ✅ Added auth check (from new code)
      if (!auth.currentUser) {
        throw new Error("You must be logged in to send messages");
      }

      // ✅ Added chat existence & participant check (from new code)
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        throw new Error("Chat does not exist");
      }

      if (!chatDoc.data().participants.includes(auth.currentUser.uid)) {
        throw new Error("You're not a participant in this chat");
      }

      // Original message sending logic (kept)
      await addDoc(collection(db, 'messages'), {
        text,
        chatId,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Update last message in chat (kept)
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message); // Added error handling
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
      // Remove orderBy until index is created
    );

    // ✅ Improved snapshot handling (from new code)
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messagesData);
        setLoading(false);
        setError(null); // Clear errors on success
      },
      (err) => {
        console.error('Messages error:', err);
        setError(err.message); // Set error state
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatId]);

  return { messages, sendMessage, loading, error }; // Added error to return
}