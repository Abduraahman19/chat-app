// src/components/Providers.js
'use client'

import { AuthContextProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  return (
    <AuthContextProvider>
      <Toaster position="bottom-center" />
      {children}
    </AuthContextProvider>
  );
}