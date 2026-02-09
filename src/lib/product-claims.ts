import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc, getDoc, orderBy, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { updateProduct, createProduct, getProductById as getFirestoreProduct } from './rd-products';
import { getProductById as getRTDBProduct } from './products';

export interface ProductClaim {
    id: string;
    product_id: string;
    product_name: string;
    requester_id: string;
    requester_name: string;
    requester_email: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    processedAt?: any;
    processedBy?: string;
}

const COLLECTION_NAME = 'product_claims';

export async function createClaimRequest(data: Omit<ProductClaim, 'id' | 'status' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating claim request:', error);
        throw error;
    }
}

export async function getClaims(isAdmin: boolean, userId?: string): Promise<ProductClaim[]> {
    try {
        let q;
        if (isAdmin) {
            q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        } else if (userId) {
            q = query(collection(db, COLLECTION_NAME), where('requester_id', '==', userId), orderBy('createdAt', 'desc'));
        } else {
            return [];
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ProductClaim));
    } catch (error) {
        console.error('Error fetching claims:', error);
        return [];
    }
}

export async function approveClaim(claimId: string, adminId: string) {
    try {
        const claimRef = doc(db, COLLECTION_NAME, claimId);
        const claimSnap = await getDoc(claimRef);

        if (!claimSnap.exists()) throw new Error('Claim not found');

        const claimData = claimSnap.data() as ProductClaim;

        // 1. Ensure product exists in Firestore
        const firestoreProduct = await getFirestoreProduct(claimData.product_id);

        if (!firestoreProduct) {
            // Fetch from RTDB
            const rtdbProduct = await getRTDBProduct(claimData.product_id);
            if (!rtdbProduct) throw new Error('Product not found in RTDB or Firestore');

            // Create in Firestore
            await setDoc(doc(db, 'rd_products', claimData.product_id), {
                product_name: rtdbProduct.product_name,
                description: rtdbProduct.product_description,
                cover_image: rtdbProduct.image_url || '',
                ip_type: 'No IP Yet',
                organization: 'Company',
                uvp: '',
                market_target: '',
                impact_industries: [],
                trl: '1',
                owner_id: claimData.requester_id,
                createdAt: serverTimestamp()
            });
        } else {
            // 2. Update product owner in Firestore
            await updateProduct(claimData.product_id, {
                owner_id: claimData.requester_id
            });
        }

        // 3. Update claim status
        await updateDoc(claimRef, {
            status: 'approved',
            processedAt: serverTimestamp(),
            processedBy: adminId
        });
    } catch (error) {
        console.error('Error approving claim:', error);
        throw error;
    }
}

export async function rejectClaim(claimId: string, adminId: string) {
    try {
        const claimRef = doc(db, COLLECTION_NAME, claimId);
        await updateDoc(claimRef, {
            status: 'rejected',
            processedAt: serverTimestamp(),
            processedBy: adminId
        });
    } catch (error) {
        console.error('Error rejecting claim:', error);
        throw error;
    }
}
