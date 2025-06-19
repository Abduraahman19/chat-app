// src/components/Chat/Message.js
'use client'

import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function Message({ message }) {
  const { user } = useAuth();
  const isCurrentUser = message.senderId === user?.uid;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        } transition-all duration-300 transform hover:scale-105`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 opacity-70 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatDate(message.createdAt)}
        </div>
      </div>
    </div>
  );
}