import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from '../components/Chat/MessageList';
import ChatInput from '../components/Chat/ChatInput';
import UserList from '../components/Chat/UserList';
import Sidebar from '../components/Layout/Sidebar';

export default function Chat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { messages, sendMessage } = useChat();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <Sidebar />
      <UserList users={users} />
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} />
        <ChatInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}