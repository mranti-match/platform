import { collection, getDocs, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDoc, where, serverTimestamp, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface RDProduct {
    id: string;
    product_name: string;
    description: string;
    cover_image: string;
    ip_type: 'Patent' | 'Copyright' | 'Design' | 'Trademark' | 'Trade Secret' | 'No IP Yet';
    ip_number?: string;
    organization: 'Company' | 'University' | 'Personal';
    uvp: string;
    market_target: string;
    impact_industries: string[];
    other_industry?: string;
    trl: string;
    owner_id: string;
    createdAt: any;
}

const COLLECTION_NAME = 'rd_products';

export async function getAllProducts(isAdmin: boolean = false, ownerId?: string): Promise<RDProduct[]> {
    try {
        let q;
        if (isAdmin) {
            // Admins see everything
            q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        } else if (ownerId) {
            // Individual users see their own
            q = query(collection(db, COLLECTION_NAME), where('owner_id', '==', ownerId));
        } else {
            // General matching query - usually for AI Match discovery
            q = query(collection(db, COLLECTION_NAME), limit(50));
        }

        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as RDProduct));

        // Sort client-side if not already sorted by server
        if (!isAdmin && ownerId) {
            products.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
        }

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<RDProduct | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as RDProduct;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function createProduct(data: Omit<RDProduct, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

export async function updateProduct(id: string, data: Partial<RDProduct>) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function deleteProduct(id: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}
