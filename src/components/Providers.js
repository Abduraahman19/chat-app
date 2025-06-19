// src/components/Providers.js
'use client'

import { AuthContextProvider } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or return a loading spinner
  }

  return <AuthContextProvider>{children}</AuthContextProvider>;
}