import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Proposal {
    id: string;
    product_id: string;
    product_name?: string;
    problem_statement_id: string;
    problem_statement_title?: string;
    problem_image_url?: string;
    problem_organization?: string;
    owner_id: string;
    owner_email?: string;
    project_title?: string;
    description: string;
    facilitation: {
        funding: boolean;
        market: boolean;
        capacity: boolean;
        sandbox: boolean;
    };
    status: 'Pending' | 'Approved' | 'Rejected';
    documents_url?: string;
    impact_outcomes?: string;
    approved_by?: string;
    createdAt: any;
}

const COLLECTION_NAME = 'proposals';

export async function getAllProposals(isAdmin: boolean = false, ownerId?: string): Promise<Proposal[]> {
    try {
        let q;
        if (isAdmin) {
            q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        } else if (ownerId) {
            // Remove orderBy from server-side query to avoid composite index requirement
            q = query(collection(db, COLLECTION_NAME), where('owner_id', '==', ownerId));
        } else {
            return [];
        }

        const querySnapshot = await getDocs(q);
        const proposals = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Proposal));

        // Sort client-side if not already sorted by server
        if (!isAdmin && ownerId) {
            proposals.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
        }

        return proposals;
    } catch (error) {
        console.error('Error fetching proposals:', error);
        return [];
    }
}

export async function getProposalById(id: string): Promise<Proposal | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Proposal;
        }
        return null;
    } catch (error) {
        console.error('Error fetching proposal:', error);
        return null;
    }
}

export async function createProposal(data: Omit<Proposal, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
            status: 'Pending'
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
    }
}

export async function updateProposal(id: string, data: Partial<Proposal>) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating proposal:', error);
        throw error;
    }
}

export async function updateProposalStatus(id: string, status: 'Approved' | 'Rejected', approverId: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            approved_by: approverId
        });
    } catch (error) {
        console.error('Error updating proposal status:', error);
        throw error;
    }
}

export async function deleteProposal(id: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting proposal:', error);
        throw error;
    }
}
