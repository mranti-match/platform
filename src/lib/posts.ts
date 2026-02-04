import { collection, getDocs, query, where, orderBy, limit, addDoc, doc, updateDoc, deleteDoc, getDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { Post } from '@/components/PostCard';

export async function incrementViews(id: string) {
    try {
        const docRef = doc(db, 'posts', id);
        await updateDoc(docRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// Helper to get collection reference gracefully
function getPostsCollection() {
    return collection(db, 'posts');
}

export interface BlogPost extends Omit<Post, 'id'> {
    id: string;
    content: string;
    categories?: string[];
    tags?: string[];
    createdAt: number;
    views?: number;
}

export async function getAllPosts(): Promise<BlogPost[]> {
    try {
        const q = query(getPostsCollection(), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BlogPost));
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const q = query(getPostsCollection(), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as BlogPost;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export async function createPost(post: Omit<BlogPost, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(getPostsCollection(), {
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            coverImage: post.coverImage || '',
            tags: [],
            categories: [],
            views: 0,
            createdAt: Date.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding document:', error);
        throw error;
    }
}
export async function updatePost(id: string, post: Partial<BlogPost>) {
    try {
        const docRef = doc(db, 'posts', id);
        // Clean up partial object to prevent undefined fields
        const cleanPost: any = {};
        if (post.title !== undefined) cleanPost.title = post.title;
        if (post.slug !== undefined) cleanPost.slug = post.slug;
        if (post.excerpt !== undefined) cleanPost.excerpt = post.excerpt;
        if (post.content !== undefined) cleanPost.content = post.content;
        if (post.coverImage !== undefined) cleanPost.coverImage = post.coverImage;
        if (post.tags !== undefined) cleanPost.tags = post.tags;
        if (post.categories !== undefined) cleanPost.categories = post.categories;
        if (post.views !== undefined) cleanPost.views = post.views;

        await updateDoc(docRef, cleanPost);
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
}

export async function deletePost(id: string) {
    try {
        const docRef = doc(db, 'posts', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
    try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as BlogPost;
        }
        return null;
    } catch (error) {
        console.error('Error fetching document by ID:', error);
        throw error;
    }
}
