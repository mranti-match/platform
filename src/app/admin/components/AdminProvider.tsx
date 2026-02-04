'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AdminContextType {
    user: User | null;
    role: string | null;
    profile: any | null;
    loading: boolean;
}

const AdminContext = createContext<AdminContextType>({ user: null, role: null, profile: null, loading: true });

export const useAdmin = () => useContext(AdminContext);

export default function AdminProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    // 1. Try to find user by UID field or document ID
                    const usersRef = collection(db, 'users');
                    const qUid = query(usersRef, where('uid', '==', currentUser.uid));
                    let querySnapshot = await getDocs(qUid);

                    let userDoc = null;
                    let userData = null;

                    if (!querySnapshot.empty) {
                        userDoc = querySnapshot.docs[0];
                        userData = userDoc.data();
                    } else {
                        // 2. Try to find by email (for legacy or manual records)
                        const qEmail = query(usersRef, where('email', '==', currentUser.email));
                        querySnapshot = await getDocs(qEmail);

                        if (!querySnapshot.empty) {
                            userDoc = querySnapshot.docs[0];
                            userData = userDoc.data();
                            // Link existing record to this UID
                            await updateDoc(doc(db, 'users', userDoc.id), {
                                uid: currentUser.uid,
                                lastLogin: serverTimestamp()
                            });
                        }
                    }

                    if (userData && userDoc) {
                        let currentRole = userData.role || 'User';
                        const userEmail = currentUser.email?.toLowerCase() || '';
                        const isAdminEmail = userEmail.endsWith('@mranti.my');

                        // Upscale logic for existing records (Case-insensitive)
                        if (userEmail === 'afnizanfaizal@mranti.my') {
                            currentRole = 'Super Admin';
                        } else if (isAdminEmail || userEmail === 'sherry@mranti.my') {
                            currentRole = 'Admin';
                        }

                        // Sync missing display fields
                        const updates: any = {};
                        if (!userData.fullName && (userData.displayName || currentUser.displayName)) {
                            updates.fullName = userData.displayName || currentUser.displayName || userEmail.split('@')[0];
                        }
                        if (!userData.displayName && (userData.fullName || currentUser.displayName)) {
                            updates.displayName = userData.fullName || currentUser.displayName || userEmail.split('@')[0];
                        }
                        if (!userData.organization && isAdminEmail) {
                            updates.organization = 'MRANTI';
                        }
                        if (currentRole !== userData.role) {
                            updates.role = currentRole;
                        }

                        if (Object.keys(updates).length > 0) {
                            await updateDoc(doc(db, 'users', userDoc.id), {
                                ...updates,
                                lastLogin: serverTimestamp()
                            });
                            userData = { ...userData, ...updates };
                        }

                        setRole(currentRole);
                        setProfile({ id: userDoc?.id, ...userData });
                    } else {
                        // 3. Create a default profile if none exists
                        const userEmail = currentUser.email?.toLowerCase() || '';
                        const isAdminEmail = userEmail.endsWith('@mranti.my');
                        let newRole = 'User';
                        if (userEmail === 'afnizanfaizal@mranti.my') {
                            newRole = 'Super Admin';
                        } else if (isAdminEmail || userEmail === 'sherry@mranti.my') {
                            newRole = 'Admin';
                        }

                        const newProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || currentUser.email?.split('@')[0],
                            fullName: currentUser.displayName || currentUser.email?.split('@')[0], // Sync with potential label usage
                            role: newRole,
                            active: true,
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                            organization: currentUser.email?.includes('mranti.my') ? 'MRANTI' : 'Independent'
                        };

                        // Use UID as document ID for new users to prevent duplicates
                        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                        setRole(newRole);
                        setProfile({ id: currentUser.uid, ...newProfile });
                    }

                    // 4. HEALING: Sync products and proposals to use current UID
                    // Only run once per session to avoid overhead
                    const healData = async () => {
                        try {
                            // Fix Proposals
                            const proposalsRef = collection(db, 'proposals');
                            const qProp = query(proposalsRef, where('owner_email', '==', currentUser.email));
                            const propSnap = await getDocs(qProp);
                            propSnap.docs.forEach(async (pDoc) => {
                                if (pDoc.data().owner_id !== currentUser.uid) {
                                    await updateDoc(doc(db, 'proposals', pDoc.id), { owner_id: currentUser.uid });
                                }
                            });

                            // Fix Products (only if stored by email previously)
                            const productsRef = collection(db, 'rd_products');
                            const qProd = query(productsRef, where('owner_id', '==', currentUser.email));
                            const prodSnap = await getDocs(qProd);
                            prodSnap.docs.forEach(async (pDoc) => {
                                await updateDoc(doc(db, 'rd_products', pDoc.id), { owner_id: currentUser.uid });
                            });
                        } catch (e) {
                            console.error("Heal failed:", e);
                        }
                    };
                    healData();

                } catch (error) {
                    console.error("Error sync user profile:", error);
                    setRole('User');
                }
            } else {
                setUser(null);
                setRole(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AdminContext.Provider value={{ user, role, profile, loading }}>
            {children}
        </AdminContext.Provider>
    );
}
