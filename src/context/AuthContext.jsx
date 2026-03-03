import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { ensureUserExists, getUserDetails } from '../services/db';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const validateEmail = (email) => {
        return email.endsWith('@york.ac.uk') || email === 'benlairig@yorksu.org';
    };

    const syncUserWithDB = async (user) => {
        if (!user) return null;
        let name = user.displayName || user.email.split('@')[0];
        await ensureUserExists(user.email, name);
        const dbUser = await getUserDetails(user.email);
        return {
            uid: user.uid,
            email: user.email,
            displayName: dbUser?.name || name,
            role: dbUser?.role || 'member'
        };
    };

    const signup = async (email, password, name) => {
        if (!validateEmail(email)) {
            throw new Error('Only @york.ac.uk emails are allowed.');
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserExists(result.user.email, name);
        const syncedUser = await syncUserWithDB(result.user);
        setCurrentUser(syncedUser);
        return result;
    };

    const loginWithEmail = async (email, password) => {
        if (!validateEmail(email)) {
            throw new Error('Only @york.ac.uk emails are allowed.');
        }
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: 'york.ac.uk' });
        const result = await signInWithPopup(auth, provider);
        if (!validateEmail(result.user.email)) {
            await logout();
            throw new Error('Only @york.ac.uk emails are allowed.');
        }
        return result;
    };

    const logout = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (validateEmail(user.email)) {
                    try {
                        const syncedUser = await syncUserWithDB(user);
                        setCurrentUser(syncedUser);
                    } catch (err) {
                        console.error("Error syncing user data:", err);
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                    logout();
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        currentUser,
        signup,
        loginWithEmail,
        loginWithGoogle,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
