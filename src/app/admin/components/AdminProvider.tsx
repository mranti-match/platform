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
    refreshProfile: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
    user: null,
    role: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { }
});

export const useAdmin = () => useContext(AdminContext);

export default function AdminProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.emailVerified) {
                console.log("Auth User detected and verified:", currentUser.email, currentUser.uid);
                setUser(currentUser);
                try {
                    let resolvedRole = 'User';
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
                        resolvedRole = userData.role || 'User';
                        const userEmail = currentUser.email?.toLowerCase() || '';
                        const isAdminEmail = userEmail.endsWith('@mranti.my');

                        // Upscale logic for existing records (Case-insensitive)
                        if (userEmail === 'afnizanfaizal@mranti.my') {
                            resolvedRole = 'Super Admin';
                        } else if (isAdminEmail || userEmail === 'sherry@mranti.my') {
                            resolvedRole = 'Admin';
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
                        if (currentUser.photoURL && !userData.photoURL) {
                            updates.photoURL = currentUser.photoURL;
                        }
                        if (resolvedRole !== userData.role) {
                            updates.role = resolvedRole;
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

                        console.log("User Profile Loaded:", userData.email, "Role:", resolvedRole);
                        setRole(resolvedRole);
                        setProfile({ id: userDoc?.id, ...userData });
                    } else {
                        const userEmailNormalized = currentUser.email?.toLowerCase() || '';
                        const isAdminEmail = userEmailNormalized.endsWith('@mranti.my');
                        let newRole = 'User';
                        if (userEmailNormalized === 'afnizanfaizal@mranti.my') {
                            resolvedRole = 'Super Admin';
                        } else if (isAdminEmail || userEmailNormalized === 'sherry@mranti.my') {
                            resolvedRole = 'Admin';
                        }

                        const newProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email, // Store the original but search using normalized
                            displayName: currentUser.displayName || currentUser.email?.split('@')[0],
                            fullName: currentUser.displayName || currentUser.email?.split('@')[0],
                            role: resolvedRole,
                            active: true,
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                            organization: isAdminEmail ? 'MRANTI' : 'Independent'
                        };

                        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
                        setRole(resolvedRole);
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

                            // Fix Proposals (Approver - only for Admin/Super Admin)
                            if (resolvedRole !== 'User') {
                                const qPropApprover = query(proposalsRef, where('approved_by', '==', currentUser.email));
                                const propApproverSnap = await getDocs(qPropApprover);
                                propApproverSnap.docs.forEach(async (pDoc) => {
                                    await updateDoc(doc(db, 'proposals', pDoc.id), { approved_by: currentUser.uid });
                                });
                            }

                            // Fix Products
                            const productsRef = collection(db, 'rd_products');
                            const qProd = query(productsRef, where('owner_id', '==', currentUser.email));
                            const prodSnap = await getDocs(qProd);
                            prodSnap.docs.forEach(async (pDoc) => {
                                if (pDoc.data().owner_id !== currentUser.uid) {
                                    await updateDoc(doc(db, 'rd_products', pDoc.id), { owner_id: currentUser.uid });
                                }
                            });

                            // Fix Problem Statements
                            const problemsRef = collection(db, 'problem_statements');
                            const qProb = query(problemsRef, where('owner_id', '==', currentUser.email));
                            const probSnap = await getDocs(qProb);
                            probSnap.docs.forEach(async (pDoc) => {
                                if (pDoc.data().owner_id !== currentUser.uid) {
                                    await updateDoc(doc(db, 'problem_statements', pDoc.id), { owner_id: currentUser.uid });
                                }
                            });

                            // Fix Proposals (Approver - only for Admin/Super Admin)
                            if (resolvedRole !== 'User') {
                                const qPropApprover = query(proposalsRef, where('approved_by', '==', currentUser.email));
                                const propApproverSnap = await getDocs(qPropApprover);
                                propApproverSnap.docs.forEach(async (pDoc) => {
                                    await updateDoc(doc(db, 'proposals', pDoc.id), { approved_by: currentUser.uid });
                                });
                            }
                        } catch (e) {
                            console.warn("Quiet heal failure (expected for non-admins):", e);
                        }
                    };
                    healData();

                } catch (error) {
                    console.error("Error sync user profile:", error);
                    setRole('User');
                }
            } else {
                if (currentUser && !currentUser.emailVerified) {
                    console.log("User detected but NOT verified.");
                }
                setUser(null);
                setRole(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);



    const refreshProfile = async () => {
        if (!user) return;
        try {
            const userDocSnap = await getDoc(doc(db, 'users', user.uid));
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                setProfile({ id: userDocSnap.id, ...data });
                console.log("Profile refreshed manually.");
            }
        } catch (error) {
            console.error("Failed to refresh profile:", error);
        }
    };

    return (
        <AdminContext.Provider value={{ user, role, profile, loading, refreshProfile }}>
            {children}
        </AdminContext.Provider>
    );
}
