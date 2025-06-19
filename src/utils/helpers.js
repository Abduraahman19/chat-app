export const formatDate = (date) => {
  if (!date) return '';
  
  // If it's a Firestore timestamp
  if (date.toDate) {
    date = date.toDate();
  }
  
  // If it's already a Date object or string that can be converted
  const jsDate = new Date(date);
  if (isNaN(jsDate.getTime())) return '';

  const now = new Date();
  const diffInHours = (now - jsDate) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    // Today - show time only
    return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    // Yesterday
    return 'Yesterday';
  } else if (diffInHours < 168) {
    // Within a week - show day name
    return jsDate.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Older than a week - show date
    return jsDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export const getUsernameFromEmail = (email) => {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
};