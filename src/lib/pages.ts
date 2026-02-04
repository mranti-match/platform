import { collection, getDocs, query, where, orderBy, limit, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const pagesCollection = collection(db, 'pages');

export interface StaticPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: 'published' | 'draft';
    createdAt: number;
}

export async function getAllPages(): Promise<StaticPage[]> {
    try {
        const q = query(pagesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as StaticPage));
    } catch (error) {
        console.error('Error fetching pages:', error);
        return [];
    }
}

export async function getPageBySlug(slug: string): Promise<StaticPage | null> {
    try {
        const q = query(pagesCollection, where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as StaticPage;
    } catch (error) {
        console.error('Error fetching page by slug:', error);
        return null;
    }
}

export async function getPageById(id: string): Promise<StaticPage | null> {
    try {
        const docRef = doc(db, 'pages', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as StaticPage;
        }
        return null;
    } catch (error) {
        console.error('Error fetching page by ID:', error);
        return null;
    }
}

export async function createPage(page: Omit<StaticPage, 'id' | 'createdAt'>) {
    const docRef = await addDoc(pagesCollection, {
        ...page,
        createdAt: Date.now(),
    });
    return docRef.id;
}

export async function updatePage(id: string, page: Partial<StaticPage>) {
    const docRef = doc(db, 'pages', id);
    await updateDoc(docRef, page);
}

export async function deletePage(id: string) {
    const docRef = doc(db, 'pages', id);
    await deleteDoc(docRef);
}
