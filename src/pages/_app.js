// src/pages/_app.js
import { AuthContextProvider } from '../context/AuthContext';
import '../app/globals.css';
import { auth } from '../utils/firebase';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // This will ensure auth state is tracked throughout the app
      console.log('Auth state changed:', user);
    });
    
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
  );
}

export default MyApp;