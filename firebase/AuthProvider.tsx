import React, { useState, useEffect, useContext, createContext } from 'react';
import nookies from 'nookies';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebaseClient';

const AuthContext = createContext<{
  user: User | null;
  uid: string | null;
  hasClaims: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  uid: null,
  hasClaims: false,
  loginWithGoogle: () => Promise.resolve(),
  loginWithEmailAndPassword: () => Promise.resolve(),
  logout: () => Promise.resolve(),
});

export function AuthProvider({ children, initialUid }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState(initialUid);
  const [hasClaims, setHasClaims] = useState(false);
  // eslint-disable-next-line no-undef
  let inHandle: NodeJS.Timer;

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    if (typeof window !== undefined) {
      (window as any).nookies = nookies;
    }
    return auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        setUid(null);
        setHasClaims(false);
        nookies.destroy(null, 'token');
        nookies.set(null, 'token', '', {
          path: '/',
        });
        return;
      }

      console.info(`Updating JWT Token`);
      const token = await user.getIdTokenResult();
      setUser(user);
      setUid(user.uid);
      const hasClaim = token.claims && 'https://hasura.io/jwt/claims' in token.claims;
      setHasClaims(hasClaim);
      nookies.destroy(null, 'token');
      if (hasClaim) {
        nookies.set(null, 'token', token.token, {
          path: '/',
        });
      }

      if (!hasClaim) {
        // no claims
        // refresh token every 10s to check for claims
        clearInterval(inHandle);
        inHandle = setInterval(async () => {
          console.info(`Refreshing JWT Token for Claims`);
          const user = auth.currentUser;
          if (user) await user.getIdTokenResult(true);
        }, 10 * 1000);
      } else {
        clearInterval(inHandle);
      }

      return () => clearInterval(inHandle);
    });
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      console.info(`Refreshing JWT Token`);
      const user = auth.currentUser;
      if (user) await user.getIdTokenResult(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, uid, hasClaims, loginWithEmailAndPassword, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
