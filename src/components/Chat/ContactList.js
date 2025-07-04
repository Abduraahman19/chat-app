// src/components/Chat/ContactList.js
'use client'

import { useAuth } from '../../context/AuthContext';

export default function ContactList({ contacts, activeContact, setActiveContact }) {
  const { user } = useAuth();

  return (
    <div className="w-68 bg-gray-100 overflow-y-auto border-r border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="font-bold text-gray-500 text-lg">Your Contacts</h2>
      </div>
      <ul>
        {contacts.map((contact) => (
          <li 
            key={contact.id}
            onClick={() => setActiveContact(contact)}
            className={`p-4 cursor-pointer hover:bg-gray-200 transition-colors ${
              activeContact?.id === contact.id ? 'bg-blue-100' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div className='truncate'>
                <p className="font-medium text-neutral-600">
                  {contact.displayName || contact.email.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500 truncate">{contact.email}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}