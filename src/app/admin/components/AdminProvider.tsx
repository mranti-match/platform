'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

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
                console.log("Auth User detected:", currentUser.email, currentUser.uid);
                setUser(currentUser);
                try {
                    // 1. TRY DIRECT ID LOOKUP FIRST (Best for permissions)
                    let userDocRef = doc(db, 'users', currentUser.uid);
                    let userDocSnap = await getDoc(userDocRef);

                    let userDoc: any = null;
                    let userData: any = null;

                    if (userDocSnap.exists()) {
                        userDoc = userDocSnap;
                        userData = userDocSnap.data();
                        console.log("Profile found via direct ID lookup.");
                    } else {
                        // 2. FALLBACK: Search by email
                        const userEmailNormalized = currentUser.email?.toLowerCase();
                        const usersRef = collection(db, 'users');
                        const qEmail = query(usersRef, where('email', '==', currentUser.email));
                        const qEmailLower = query(usersRef, where('email', '==', userEmailNormalized));

                        let emailSnap = await getDocs(qEmail);
                        if (emailSnap.empty && userEmailNormalized !== currentUser.email) {
                            emailSnap = await getDocs(qEmailLower);
                        }

                        if (!emailSnap.empty) {
                            userDoc = emailSnap.docs[0];
                            userData = userDoc.data();
                            console.log("Found user via email backup search.");

                            // Try to sync UID - wrap in try-catch because rules might block update
                            try {
                                await updateDoc(doc(db, 'users', userDoc.id), {
                                    uid: currentUser.uid,
                                    lastLogin: serverTimestamp()
                                });
                            } catch (e) {
                                console.warn("Could not sync UID to legacy record (likely permissions). Proceeding anyway.");
                            }
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
                            try {
                                // Important: We update DB, but we don't 'await' it critically for the role to work
                                // This prevents a permission-denied error from crashing the whole login
                                await updateDoc(doc(db, 'users', userDoc.id), {
                                    ...updates,
                                    lastLogin: serverTimestamp()
                                });
                            } catch (e) {
                                console.warn("Failed to update profile updates to DB (permissions). UI will still upscale role.");
                            }
                            userData = { ...userData, ...updates };
                        }

                        console.log("User Profile Loaded:", userData.email, "Role:", currentRole);
                        setRole(currentRole);
                        setProfile({ id: userDoc?.id, ...userData });
                    } else {
                        const userEmailNormalized = currentUser.email?.toLowerCase() || '';
                        const isAdminEmail = userEmailNormalized.endsWith('@mranti.my');
                        let newRole = 'User';
                        if (userEmailNormalized === 'afnizanfaizal@mranti.my') {
                            newRole = 'Super Admin';
                        } else if (isAdminEmail || userEmailNormalized === 'sherry@mranti.my') {
                            newRole = 'Admin';
                        }

                        const newProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email, // Store the original but search using normalized
                            displayName: currentUser.displayName || currentUser.email?.split('@')[0],
                            fullName: currentUser.displayName || currentUser.email?.split('@')[0],
                            role: newRole,
                            active: true,
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                            organization: isAdminEmail ? 'MRANTI' : 'Independent'
                        };

                        // Use UID as document ID for new users to prevent duplicates
                        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                        setRole(newRole);
                        setProfile({ id: currentUser.uid, ...newProfile });
                    }

                    // 5. HEALING: Sync products and proposals to use current UID
                    const healData = async () => {
                        try {
                            const userEmail = currentUser.email?.toLowerCase();
                            if (!userEmail) return;

                            // Fix Proposals (Owner)
                            const proposalsRef = collection(db, 'proposals');
                            const qPropOwner = query(proposalsRef, where('owner_email', '==', currentUser.email));
                            const propOwnerSnap = await getDocs(qPropOwner);
                            propOwnerSnap.docs.forEach(async (pDoc) => {
                                if (pDoc.data().owner_id !== currentUser.uid) {
                                    await updateDoc(doc(db, 'proposals', pDoc.id), { owner_id: currentUser.uid });
                                }
                            });

                            // Fix Proposals (Approver - handle cases where email was used)
                            const qPropApprover = query(proposalsRef, where('approved_by', '==', currentUser.email));
                            const propApproverSnap = await getDocs(qPropApprover);
                            propApproverSnap.docs.forEach(async (pDoc) => {
                                await updateDoc(doc(db, 'proposals', pDoc.id), { approved_by: currentUser.uid });
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
