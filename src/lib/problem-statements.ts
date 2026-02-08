import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface ProblemStatement {
    id: string;
    title: string;
    organization: string;
    description: string;
    sector: string;
    status: 'Open' | 'Closed' | 'Draft';
    createdAt: number;
    owner_id: string;
    deadline?: string;
    image_url?: string;
}

const COLLECTION_NAME = 'problem_statements';

export async function getAllProblemStatements(isAdmin: boolean = false, ownerId?: string): Promise<ProblemStatement[]> {
    try {
        let q;
        if (isAdmin) {
            q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        } else if (ownerId) {
            q = query(collection(db, COLLECTION_NAME), where('owner_id', '==', ownerId));
        } else {
            // Publicly open statements
            q = query(collection(db, COLLECTION_NAME), where('status', '==', 'Open'));
        }

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ProblemStatement));

        // Sort client-side if we used where filters which might break orderBy without index
        if (!isAdmin) {
            results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        return results;
    } catch (error) {
        console.error('Error fetching problem statements:', error);
        return [];
    }
}

export async function getProblemStatementById(id: string): Promise<ProblemStatement | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as ProblemStatement;
        }
        return null;
    } catch (error) {
        console.error('Error fetching problem statement:', error);
        return null;
    }
}

export async function createProblemStatement(data: Omit<ProblemStatement, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: Date.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating problem statement:', error);
        throw error;
    }
}

export async function updateProblemStatement(id: string, data: Partial<ProblemStatement>) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating problem statement:', error);
        throw error;
    }
}

export async function deleteProblemStatement(id: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting problem statement:', error);
        throw error;
    }
}
