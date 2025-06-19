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
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  // User sign up with email, password and display name
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile and send verification email
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);

      // Create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email.toLowerCase().trim(),
        displayName,
        uid: userCredential.user.uid,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`
      });

      // Force immediate logout after signup
      await signOut(auth);

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Add this function to resend verification emails
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error) {
      console.error('Resend error:', error);
      throw error;
    }
  };

  // User login with email and password
  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date().toISOString()
      });

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // User logout
  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message);
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete from Auth
      await deleteUser(auth.currentUser);

      toast.success('Account deleted successfully');
      return true;
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error(error.message);
      return false;
    }
  };

  // Add a new contact by email
const addContact = async (email) => {
  if (!user) throw new Error('Please login first');

  try {
    const cleanEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user found with this email');
    }

    const contactDoc = querySnapshot.docs[0];
    const contactData = contactDoc.data();
    const contactId = contactDoc.id;

    // Validation checks
    if (contactId === user.uid) {
      throw new Error("You can't add yourself");
    }
    if (contacts.some(c => c.id === contactId)) {
      throw new Error('Contact already exists');
    }

    // Create chat room with both participants
    const roomId = [user.uid, contactId].sort().join('_');
    await setDoc(doc(db, 'chats', roomId), {
      participants: [user.uid, contactId],
      createdAt: new Date(),
      lastMessage: null,
      lastMessageAt: null
    });

    // Add to local state
    setContacts(prev => [...prev, { 
      id: contactId, 
      ...contactData,
      chatId: roomId // Store chatId for easy reference
    }]);

    return contactId;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

  // Handle contact addition with UI feedback
  const handleAddContact = async () => {
    if (!newContactEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await addContact(newContactEmail);
      setNewContactEmail('');
      setShowContactForm(false);
      toast.success('Contact added successfully!');
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to add contact:', error);
    }
  };

  // Remove a contact
  const removeContact = async (contactId) => {
    try {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact removed');
    } catch (error) {
      console.error('Error removing contact:', error);
      toast.error('Failed to remove contact');
    }
  };

  // Fetch user's contacts
  const fetchContacts = async (userId) => {
    if (!userId) return;

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const contactIds = querySnapshot.docs.flatMap(doc =>
        doc.data().participants.filter(id => id !== userId)
      );

      // Get unique contacts
      const uniqueContactIds = [...new Set(contactIds)];
      const contactsData = await Promise.all(
        uniqueContactIds.map(async id => {
          const userDoc = await getDoc(doc(db, 'users', id));
          return { id, ...userDoc.data() };
        })
      );

      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return;

    try {
      // Update auth profile
      await updateProfile(auth.currentUser, updates);

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), updates);

      // Refresh user data
      setUser({ ...auth.currentUser });
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message);
      return false;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchContacts(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      contacts,
      newContactEmail,
      setNewContactEmail,
      showContactForm,
      setShowContactForm,
      signUp,
      logIn,
      logOut,
      deleteAccount,
      addContact,
      handleAddContact,
      removeContact,
      updateUserProfile,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}