import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isAuthor: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Check if profile exists, if not create one with default 'reader' role
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create default profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'reader',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile fetch error:", error);
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isAuthor: profile?.role === 'author' || profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
