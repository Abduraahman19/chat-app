export const formatGroupDate = (date) => {
  if (!date) return '';

  if (date.toDate) {
    date = date.toDate();
  }

  const jsDate = new Date(date);
  if (isNaN(jsDate.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
  const diffInDays = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  
  // For all older messages, show full date format
  return jsDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: jsDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const getUsernameFromEmail = (email) => {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
};