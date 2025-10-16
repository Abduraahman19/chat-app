'use client'
import { motion } from 'framer-motion';

export default function ProfilePicture({ 
  user, 
  size = 'md', 
  showOnlineStatus = false, 
  isOnline = false,
  className = '',
  onClick = null,
  animate = true
}) {
  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  const statusSizes = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5',
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 -bottom-1 -right-1',
    lg: 'w-3.5 h-3.5 -bottom-1 -right-1',
    xl: 'w-4 h-4 -bottom-1 -right-1',
    '2xl': 'w-5 h-5 -bottom-1 -right-1',
    '3xl': 'w-6 h-6 -bottom-1 -right-1'
  };

  // Get display name or fallback
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const photoURL = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=200&bold=true`;

  // Generate initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const ProfileContent = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div
        className={`relative flex items-center justify-center font-semibold text-white border-2 border-white rounded-full shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 overflow-hidden ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
        onClick={onClick}
      >
        <img
          src={photoURL}
          alt={displayName}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=200&bold=true`;
          }}
        />
        

      </div>

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className={`absolute rounded-full border-2 border-white ${statusSizes[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );

  return <ProfileContent />;
}