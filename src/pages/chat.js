'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import ContactList from '../components/Chat/ContactList';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { doc, deleteDoc, updateDoc, arrayRemove, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { toast } from 'react-hot-toast';

export default function Chat() {
  const { user, loading, contacts } = useAuth();
  const router = useRouter();
  const [activeContact, setActiveContact] = useState(null);
  const { messages, sendMessage } = useChat(activeContact ? [user.uid, activeContact.id].sort().join('_') : null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDeleteMessage = async (messageId, deleteForEveryone) => {
    if (!activeContact) return;
    
    try {
      const chatId = [user.uid, activeContact.id].sort().join('_');
      
      if (deleteForEveryone) {
        // Delete for everyone - remove from Firestore
        await deleteDoc(doc(db, 'messages', messageId));
        
        // Update last message in chat if needed
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists() && chatSnap.data().lastMessageId === messageId) {
          // Find new last message
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          
          const lastMessageSnap = await getDocs(messagesQuery);
          if (!lastMessageSnap.empty) {
            const lastMsg = lastMessageSnap.docs[0];
            await updateDoc(chatRef, {
              lastMessage: lastMsg.data().text,
              lastMessageAt: lastMsg.data().createdAt,
              lastMessageId: lastMsg.id
            });
          } else {
            // No messages left
            await updateDoc(chatRef, {
              lastMessage: null,
              lastMessageAt: null,
              lastMessageId: null
            });
          }
        }
      } else {
        // Delete only for me - add to deletedMessages array
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          deletedMessages: arrayRemove(messageId)
        });
      }
      
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ContactList
          contacts={contacts}
          activeContact={activeContact}
          setActiveContact={setActiveContact}
        />
        <div className="flex-1 p-3 bg-white flex flex-col overflow-hidden">
          {activeContact ? (
            <>
              <div className="flex items-center bg-neutral-200 p-4 rounded-lg shadow-2xl text-gray-500">
                <h2 className="text-xl font-bold">
                  Chat with {activeContact.displayName || activeContact.email.split('@')[0]}
                </h2>
              </div>

              <MessageList 
                messages={messages.filter(msg => 
                  !user?.deletedMessages?.includes(msg.id)
                )} 
                onDeleteMessage={handleDeleteMessage}
              />
              <ChatInput
                sendMessage={sendMessage}
                onNewContact={() => setActiveContact(null)}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-2xl text-gray-600 font-bold mb-4">Start a Conversation</h2>
                <p className="text-gray-600 mb-6">
                  Select a contact from your list or add a new one to start chatting.
                </p>
                <ChatInput
                  sendMessage={() => { }}
                  onNewContact={() => { }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}