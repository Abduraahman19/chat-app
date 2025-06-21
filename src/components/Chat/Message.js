'use client'
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function Message({ message, onDelete }) {
  const { user } = useAuth();
  const isCurrentUser = message.senderId === user?.uid;
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          !buttonRef.current?.contains(e.target)) {
        setShowMenu(false);
        setShowDeleteOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (deleteForEveryone) => {
    onDelete(message.id, deleteForEveryone);
    setShowDeleteOptions(false);
    setShowMenu(false);
    toast.success(deleteForEveryone ? 'Message deleted for everyone' : 'Message deleted for you');
  };

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 px-4 relative`}
      onMouseEnter={() => isCurrentUser && setShowMenu(true)}
      onMouseLeave={() => {
        if (!showDeleteOptions) {
          setShowMenu(false);
        }
      }}
    >
      {/* Message container with left-aligned menu */}
      <div className="flex items-center">
        {/* Three dots button - always on left side */}
        {isCurrentUser && showMenu && (
          <div className="relative">
            <button
              ref={buttonRef}
              className="mr-2 bg-gray-200 text-gray-700 rounded-full p-1 shadow-sm hover:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteOptions(!showDeleteOptions);
              }}
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            
            {/* Delete options popup - positioned to the LEFT of button */}
            {showDeleteOptions && (
              <div 
                ref={menuRef}
                className="absolute right-full top-0 mr-1 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200"
              >
                <button
                  onClick={() => handleDelete(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Delete for me
                </button>
                <button
                  onClick={() => handleDelete(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Delete for everyone
                </button>
                <button
                  onClick={() => setShowDeleteOptions(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser
              ? 'bg-[#005c4b] text-white rounded-tr-none'
              : 'bg-[#202c33] text-white rounded-tl-none'
            } shadow-md`}
        >
          <p className="text-sm">{message.text}</p>
          <div className={`flex items-center justify-end mt-1 space-x-1 ${isCurrentUser ? 'text-[#a7b6b2]' : 'text-[#a7b6b2]'
            }`}>
            <span className="text-xs">
              {formatDate(message.createdAt)}
            </span>
            {isCurrentUser && (
              <span className="ml-1">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}