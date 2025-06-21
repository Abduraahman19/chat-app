'use client'
import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ChatInput({ sendMessage, onNewContact }) {
  const [message, setMessage] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-focus and select input when component mounts or after sending
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Don't select all text on focus for better UX with multi-line
      inputRef.current.focus();
    }
  }, [isSending, showContactForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || isSending) return;

    const messageToSend = message;
    setMessage(''); // Clear input immediately
    setIsSending(true);

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      setMessage(messageToSend); // Restore message if error occurs
      toast.error(error.message);
    } finally {
      setIsSending(false);
      // Focus is automatically handled by the useEffect
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const { addContact } = useAuth();
      await addContact(newContactEmail);
      setNewContactEmail('');
      setShowContactForm(false);
      if (onNewContact) onNewContact();
      toast.success("Contact added successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Allow Shift+Enter for new lines
  };

  // Auto-resize textarea based on content
  const handleInput = (e) => {
    setMessage(e.target.value);
    // Auto-resize the textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div ref={containerRef} className="p-4 border-t bg-white">
      {showContactForm && (
        <form onSubmit={handleAddContact} className="mb-4 flex items-center bg-neutral-200 p-4 rounded-lg">
          <input
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            placeholder="Enter friend's email"
            className="flex-1 border-gray-500 border bg-white rounded-full py-2 px-4 text-black focus:outline-none"
            required
            autoFocus
          />
          <button
            type="submit"
            className="ml-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>
      )}

      <form onSubmit={handleSubmit} className="flex items-end bg-neutral-200 p-4 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setShowContactForm(!showContactForm);
          }}
          className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full p-2 self-center"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border-gray-500 bg-white border rounded-2xl py-2 px-4 text-black focus:outline-none resize-none max-h-32 overflow-y-auto"
          disabled={isSending}
          autoFocus={!showContactForm}
          rows="1"
          style={{ minHeight: '44px' }}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 self-center"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}