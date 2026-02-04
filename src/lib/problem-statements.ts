import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface ProblemStatement {
    id: string;
    title: string;
    organization: string;
    description: string;
    sector: string;
    status: 'Open' | 'Closed' | 'Draft';
    createdAt: number;
    deadline?: string;
    image_url?: string;
}

const COLLECTION_NAME = 'problem_statements';

export async function getAllProblemStatements(): Promise<ProblemStatement[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ProblemStatement));
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
