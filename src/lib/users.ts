import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, where } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebase';

export type UserRole = 'User' | 'Admin' | 'Super Admin';
// ... existing types ...

export async function requestPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw error;
    }
}

export interface AppUser {
    id: string;
    uid?: string; // Firebase Auth UID
    email: string;
    displayName: string;
    fullName: string;
    role: UserRole;
    organization?: string;
    designation?: string;
    position?: string;
    department?: string;
    phoneNumber?: string;
    bio?: string;
    photoURL?: string;
    active: boolean;
    createdAt: any;
    lastLogin?: any;
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
    try {
        const q = query(collection(db, COLLECTION_NAME), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as AppUser;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
}

const COLLECTION_NAME = 'users';

export async function getAllUsers(): Promise<AppUser[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AppUser));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function getUserById(id: string): Promise<AppUser | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as AppUser;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function getUserByUid(uid: string): Promise<AppUser | null> {
    try {
        // 1. Try direct ID fetch (if UID is doc ID)
        const directUser = await getUserById(uid);
        if (directUser) return directUser;

        // 2. Try query by 'uid' field (if UID is a field)
        const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as AppUser;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user by UID:', error);
        return null;
    }
}

/**
 * Migration helper to link a user document to their Auth UID
 */
export async function syncUserUid(email: string, uid: string) {
    try {
        const user = await getUserByEmail(email);
        if (user && !user.uid) {
            await updateAppUser(user.id, { uid });
            console.log(`Synced UID for legacy user: ${email}`);
            return { ...user, uid };
        }
        return user;
    } catch (error) {
        console.error('Error syncing user UID:', error);
        return null;
    }
}

export async function createAppUser(userData: Omit<AppUser, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...userData,
            createdAt: serverTimestamp(),
            active: true
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateAppUser(id: string, userData: Partial<AppUser>) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, userData);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function deleteAppUser(id: string) {
    try {
        const user = await getUserById(id);
        if (!user) return;

        const uid = user.uid;
        const email = user.email;

        // 1. Prepare for Batch Deletion
        const { writeBatch } = await import('firebase/firestore');
        const batch = writeBatch(db);

        // A. Delete RD Products
        const productsQ = query(collection(db, 'rd_products'), where('owner_id', 'in', [uid || 'none', email]));
        const productSnaps = await getDocs(productsQ);
        productSnaps.forEach(d => batch.delete(d.ref));

        // B. Delete Problem Statements
        const problemsQ = query(collection(db, 'problem_statements'), where('owner_id', 'in', [uid || 'none', email]));
        const problemSnaps = await getDocs(problemsQ);
        problemSnaps.forEach(d => batch.delete(d.ref));

        // C. Delete Proposals (Collaboration)
        const proposalsQ = query(collection(db, 'proposals'), where('owner_id', 'in', [uid || 'none', email]));
        const proposalSnaps = await getDocs(proposalsQ);
        proposalSnaps.forEach(d => batch.delete(d.ref));

        // D. Delete the User Record
        const userRef = doc(db, COLLECTION_NAME, id);
        batch.delete(userRef);

        // 2. Commit Firestore deletions
        await batch.commit();

        // 3. Cleanup Storage (Best effort)
        if (uid) {
            try {
                const { deleteFolder } = await import('./storage');
                await deleteFolder(`users/${uid}`);
            } catch (storageError) {
                console.warn('Storage cleanup skipped due to permissions. Manual cleanup may be required for path:', `users/${uid}`);
            }
        }

    } catch (error) {
        console.error('Error in cascading user deletion:', error);
        throw error;
    }
}
