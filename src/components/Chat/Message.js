// src/components/Chat/Message.js
'use client'

import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function Message({ message }) {
  const { user } = useAuth();
  const isCurrentUser = message.senderId === user?.uid;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-[#005c4b] text-white rounded-tr-none'
            : 'bg-[#202c33] text-white rounded-tl-none'
        } shadow-md`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 text-right ${
          isCurrentUser ? 'text-[#a7b6b2]' : 'text-[#a7b6b2]'
        }`}>
          {formatDate(message.createdAt)}
          {isCurrentUser && (
            <span className="ml-1">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
}