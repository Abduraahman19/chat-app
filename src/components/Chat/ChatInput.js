// src/components/Chat/ChatInput.js
'use client'
import { useState } from 'react';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast'; // ✅ Added toast

export default function ChatInput({ sendMessage, onNewContact }) {
  const [message, setMessage] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const { user, addContact } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && user) {
      try {
        await sendMessage(message);
        setMessage('');
      } catch (error) {
        toast.error(error.message); // ✅ Added error toast
      }
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await addContact(newContactEmail);
      setNewContactEmail('');
      setShowContactForm(false);
      if (onNewContact) onNewContact();
      toast.success("Contact added successfully!"); // ✅ Added success toast
    } catch (error) {
      toast.error(error.message); // ✅ Replaced alert with toast
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      {showContactForm && (
        <form onSubmit={handleAddContact} className="mb-4 flex items-center bg-neutral-200 p-4 rounded-lg">
          <input
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            placeholder="Enter friend's email"
            className="flex-1 border-gray-500 border rounded-full py-2 px-4 text-black focus:outline-none"
            required
          />
          <button
            type="submit"
            className="ml-2 bg-green-500 cursor-pointer text-white rounded-full p-2 hover:bg-green-600"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>
      )}

      <form onSubmit={handleSubmit} className="flex items-center bg-neutral-200 p-4 rounded-lg">
        <button
          type="button"
          onClick={() => setShowContactForm(!showContactForm)}
          className="mr-2 bg-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-400 cursor-pointer"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a Message..."
          className="flex-1 border-gray-500 bg-white border rounded-full py-2 px-4 text-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="ml-2 bg-blue-500 text-white rounded-full cursor-pointer p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}