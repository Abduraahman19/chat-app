'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  deleteUser
} from 'firebase/auth';
import { db } from '../utils/firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection,
  query, where, getDocs, updateDoc,
  deleteDoc, arrayUnion, serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const router = useRouter();

  // Enhanced presence management
  const updatePresence = async (isOnline) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastSeen: isOnline ? serverTimestamp() : 'offline',
        status: isOnline ? "Online" : "Offline",
        isOnline: isOnline
      });
      setIsUserOnline(isOnline);
    } catch (error) {
      console.error("Error updating presence:", error);
      toast.error("Failed to update online status");
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    // Update presence on mount
    updatePresence(true);
    
    // Set up interval to update presence
    const interval = setInterval(() => updatePresence(true), 30000); // Every 30 seconds

    // Handle disconnect
    const handleBeforeUnload = () => updatePresence(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      updatePresence(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid]);

  // Enhanced fetchContacts with error handling
  const fetchContacts = async (userId) => {
    if (!userId) {
      setContacts([]);
      return;
    }

    try {
      // First get all chats where user is a participant
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      // Extract all unique contact IDs
      const contactIds = [];
      querySnapshot.forEach(doc => {
        const participants = doc.data().participants;
        const otherUserId = participants.find(id => id !== userId);
        if (otherUserId && !contactIds.includes(otherUserId)) {
          contactIds.push(otherUserId);
        }
      });

      // Fetch contact details in parallel
      const contactsData = await Promise.all(
        contactIds.map(async id => {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            return { 
              id: userDoc.id,
              ...userDoc.data(),
              chatId: [userId, id].sort().join('_')
            };
          }
          return null;
        })
      );

      // Filter out any null values and set contacts
      setContacts(contactsData.filter(contact => contact !== null));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
      setContacts([]);
    }
  };

  // User sign up
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update auth profile
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email.toLowerCase().trim(),
        displayName,
        emailVerified: false,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: "Hey there! I'm using ChatApp",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
      });

      // Log out and ask user to verify email
      await signOut(auth);
      return { success: true, message: 'Verification email sent. Please verify your email before logging in.' };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // User login
  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Update last login timestamp
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true
      });

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // User logout
  const logOut = async () => {
    try {
      if (user) {
        // Update presence status before logging out
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeen: serverTimestamp(),
          isOnline: false
        });
      }
      
      await signOut(auth);
      setUser(null);
      setContacts([]);
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return false;
    
    try {
      // Delete user document first
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Then delete auth user
      await deleteUser(auth.currentUser);
      
      toast.success('Account deleted successfully');
      return true;
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account. Please try again.');
      return false;
    }
  };

  // Add contact with proper validation
const addContact = async (email) => {
  if (!user) throw new Error('Please login first');
  
  const cleanEmail = email.toLowerCase().trim();
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    // Check if user exists with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user found with this email');
    }

    const contactDoc = querySnapshot.docs[0];
    const contactData = contactDoc.data();
    const contactId = contactDoc.id;

    if (contactId === user.uid) {
      throw new Error("You can't add yourself as a contact");
    }

    // Check if contact already exists
    const existingContact = contacts.find(c => c.id === contactId);
    if (existingContact) {
      throw new Error('Contact already exists in your list');
    }

    // Create chat room with additional metadata
    const roomId = [user.uid, contactId].sort().join('_');
    const chatRef = doc(db, 'chats', roomId);
    
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      throw new Error('Chat with this contact already exists');
    }

    // Create new chat with all required fields
    await setDoc(chatRef, {
      participants: [user.uid, contactId],
      participantNames: {
        [user.uid]: user.displayName || getUsernameFromEmail(user.email),
        [contactId]: contactData.displayName || getUsernameFromEmail(contactData.email)
      },
      participantPhotos: {
        [user.uid]: user.photoURL || '',
        [contactId]: contactData.photoURL || ''
      },
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
      lastSeen: {
        [user.uid]: serverTimestamp(),
        [contactId]: null
      }
    });

    // Update local state
    setContacts(prev => [...prev, {
      id: contactId,
      ...contactData,
      chatId: roomId
    }]);

    return contactId;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update Firebase Auth profile
      await updateFirebaseProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        status: profileData.status || "Hey there! I'm using ChatApp",
        updatedAt: serverTimestamp()
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        status: profileData.status
      }));

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        await fetchContacts(currentUser.uid);
        // Update presence status
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastSeen: serverTimestamp(),
          isOnline: true
        });
      } else {
        setContacts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      contacts,
      isUserOnline,
      signUp,
      logIn,
      logOut,
      deleteAccount,
      addContact,
      resendVerificationEmail,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}