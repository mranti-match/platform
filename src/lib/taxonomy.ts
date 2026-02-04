import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Taxonomy {
    id: string;
    name: string;
    slug: string;
    description?: string;
    count?: number; // Number of posts using this taxonomy
}

// Helper to generate slug
export const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const categoriesCollection = collection(db, 'categories');
const tagsCollection = collection(db, 'tags');

// Categories CRUD
export async function getCategories(): Promise<Taxonomy[]> {
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Taxonomy));
}

export async function createCategory(data: Omit<Taxonomy, 'id'>) {
    const docRef = await addDoc(categoriesCollection, data);
    return docRef.id;
}

export async function updateCategory(id: string, data: Partial<Taxonomy>) {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, data);
}

export async function deleteCategory(id: string) {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
}

// Tags CRUD
export async function getTags(): Promise<Taxonomy[]> {
    const q = query(tagsCollection, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Taxonomy));
}

export async function createTag(data: Omit<Taxonomy, 'id'>) {
    const docRef = await addDoc(tagsCollection, data);
    return docRef.id;
}

export async function updateTag(id: string, data: Partial<Taxonomy>) {
    const docRef = doc(db, 'tags', id);
    await updateDoc(docRef, data);
}

export async function deleteTag(id: string) {
    const docRef = doc(db, 'tags', id);
    await deleteDoc(docRef);
}
