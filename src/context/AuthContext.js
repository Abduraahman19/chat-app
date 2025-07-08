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

  // Enhanced signUp function
  const signUp = async (email, password, displayName) => {
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update auth profile
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email.toLowerCase().trim(),
        displayName,
        emailVerified: true, // Set to true directly
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: "Hey there! I'm using ChatApp",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
      });

      return {
        success: true,
        user: userCredential.user,
        message: 'Account created successfully!'
      };
    } catch (error) {
      // Cleanup if failed
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (deleteError) {
          console.error('Error cleaning up failed signup:', deleteError);
        }
      }

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

  // Enhanced logIn function
  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check/create user document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email.toLowerCase().trim(),
          displayName: userCredential.user.displayName || '',
          emailVerified: true, // Set to true directly
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
          status: "Hey there! I'm using ChatApp",
          photoURL: userCredential.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userCredential.user.displayName || 'User')}&background=random`
        });
      }

      // Update last login timestamp
      await updateDoc(doc(db, 'users', user.uid), {
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

  const logOut = async () => {
    try {
      // Skip Firestore update if user doesn't exist
      if (!user) {
        await signOut(auth);
        return;
      }

      // Try to update presence status with timeout
      try {
        const updatePromise = updateDoc(doc(db, 'users', user.uid), {
          lastSeen: serverTimestamp(),
          isOnline: false
        });

        // Add timeout to prevent hanging
        await Promise.race([
          updatePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Presence update timeout')), 3000)
          )
        ]);
      } catch (updateError) {
        console.warn("Presence update failed or timed out:", updateError);
      }

      await signOut(auth);
      setUser(null);
      setContacts([]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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
  // const addContact = async (email) => {
  //   if (!user) throw new Error('Please login first');

  //   const cleanEmail = email.toLowerCase().trim();

  //   // Validate email format
  //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
  //     throw new Error('Please enter a valid email address');
  //   }

  //   try {
  //     // Check if user exists with this email
  //     const usersRef = collection(db, 'users');
  //     const q = query(usersRef, where('email', '==', cleanEmail));
  //     const querySnapshot = await getDocs(q);

  //     if (querySnapshot.empty) {
  //       throw new Error('No account found with this email. Please ask them to create an account first.');
  //     }

  //     const contactDoc = querySnapshot.docs[0];
  //     const contactData = contactDoc.data();
  //     const contactId = contactDoc.id;

  //     // Prevent adding yourself
  //     if (contactId === user.uid) {
  //       throw new Error("You can't add yourself as a contact");
  //     }

  //     // Check if contact already exists
  //     const existingContact = contacts.find(c => c.id === contactId);
  //     if (existingContact) {
  //       throw new Error('This contact is already in your list');
  //     }

  //     // Create chat room
  //     const roomId = [user.uid, contactId].sort().join('_');
  //     const chatRef = doc(db, 'chats', roomId);

  //     // Check if chat already exists
  //     const chatDoc = await getDoc(chatRef);
  //     if (chatDoc.exists()) {
  //       throw new Error('Chat with this contact already exists');
  //     }

  //     // Create new chat document
  //     await setDoc(chatRef, {
  //       participants: [user.uid, contactId],
  //       participantNames: {
  //         [user.uid]: user.displayName || getUsernameFromEmail(user.email),
  //         [contactId]: contactData.displayName || getUsernameFromEmail(contactData.email)
  //       },
  //       participantPhotos: {
  //         [user.uid]: user.photoURL || '',
  //         [contactId]: contactData.photoURL || ''
  //       },
  //       createdAt: serverTimestamp(),
  //       lastMessage: null,
  //       lastMessageAt: null,
  //       lastSeen: {
  //         [user.uid]: serverTimestamp(),
  //         [contactId]: null
  //       }
  //     });

  //     // Update local state
  //     setContacts(prev => [...prev, {
  //       id: contactId,
  //       ...contactData,
  //       chatId: roomId
  //     }]);

  //     return contactId;
  //   } catch (error) {
  //     console.error('Error adding contact:', error);
  //     throw error; // Re-throw with appropriate message
  //   }
  // };


  const addContact = async (email) => {
    try {
      if (!user) throw new Error('Authentication required. Please login first.');

      const cleanEmail = email.toLowerCase().trim();

      // Email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if user exists with this email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No user found with this email. They need to sign up first.');
      }

      const contactDoc = querySnapshot.docs[0];
      const contactData = contactDoc.data();
      const contactId = contactDoc.id;

      // Prevent self-add
      if (contactId === user.uid) {
        throw new Error("You can't add yourself as a contact");
      }

      // Check if contact already exists
      const existingChatQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const existingChats = await getDocs(existingChatQuery);

      const alreadyExists = existingChats.docs.some(doc =>
        doc.data().participants.includes(contactId)
      );

      if (alreadyExists) {
        throw new Error('This contact is already in your list');
      }

      // Create chat ID (sorted to ensure consistency)
      const chatId = [user.uid, contactId].sort().join('_');

      // Create chat document with all required fields
      await setDoc(doc(db, 'chats', chatId), {
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
        },
        // Additional useful metadata
        isGroup: false,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setContacts(prev => [...prev, {
        id: contactId,
        ...contactData,
        chatId: chatId
      }]);

      return {
        success: true,
        chatId: chatId,
        contactName: contactData.displayName || cleanEmail.split('@')[0]
      };

    } catch (error) {
      console.error('Add Contact Error:', error);

      let errorMessage = error.message;

      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        errorMessage = 'You dont have permission to add contacts.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Required data not found. Please try again.';
      }

      throw new Error(errorMessage);
    }
  };

  // // Resend verification email
  // // Enhanced resendVerificationEmail function
  // const resendVerificationEmail = async () => {
  //   if (!auth.currentUser) {
  //     throw new Error('No user is currently signed in');
  //   }

  //   try {
  //     // Force refresh the user token first
  //     await auth.currentUser.getIdToken(true);

  //     // Then send verification email with custom settings
  //     await sendEmailVerification(auth.currentUser, {
  //       url: `${window.location.origin}/verify-email`, // Redirect after verification
  //       handleCodeInApp: true // Better for mobile apps
  //     });

  //     return {
  //       success: true,
  //       message: 'Verification email sent successfully! Check your inbox and spam folder.'
  //     };
  //   } catch (error) {
  //     console.error('Error resending verification email:', error);

  //     let errorMessage = 'Failed to send verification email. Please try again.';
  //     if (error.code === 'auth/too-many-requests') {
  //       errorMessage = 'Too many requests. Please wait before trying again.';
  //     }

  //     throw new Error(errorMessage);
  //   }
  // };

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
      if (currentUser) {
        // No need to check verification status
        await fetchContacts(currentUser.uid);
        // Update presence status
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastSeen: serverTimestamp(),
          isOnline: true
        });
      }
      setUser(currentUser);
      setLoading(false);
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
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}