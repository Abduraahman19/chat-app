export const getUsernameFromEmail = (email) => {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
};

export const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};