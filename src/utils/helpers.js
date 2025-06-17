export const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '...';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getUsernameFromEmail = (email) => {
  return email?.split('@')[0] || 'Anonymous';
};