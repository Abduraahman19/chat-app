import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';

export function useChat(roomId = 'general') {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (text, user) => {
    try {
      await addDoc(collection(db, 'messages'), {
        text,
        roomId,
        userId: user.uid,
        userEmail: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    });

    return unsubscribe;
  }, [roomId]);

  return { messages, sendMessage };
}