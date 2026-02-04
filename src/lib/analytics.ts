import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface DailyStats {
    date: string; // YYYY-MM-DD
    visits: number;
}

export interface CountryStat {
    country: string;
    count: number;
}

export interface PostView {
    postId: string;
    title: string;
    coverImage?: string;
    slug?: string;
    createdAt?: number;
    views: number;
}

// Collection Names
const ANALYTICS_COL = 'analytics';
const DAILY_STATS_DOC = 'daily_stats';
const COUNTRIES_DOC = 'countries';
const POST_VIEWS_COL = 'post_views';

/**
 * Tracks a page visit. Increments daily total and country count.
 */
export async function trackVisit(countryCode: string = 'Unknown') {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, ANALYTICS_COL, DAILY_STATS_DOC);
    const countryRef = doc(db, ANALYTICS_COL, COUNTRIES_DOC);

    try {
        // Increment daily visits
        await setDoc(statsRef, {
            [today]: increment(1)
        }, { merge: true });

        // Increment country count
        await setDoc(countryRef, {
            [countryCode]: increment(1)
        }, { merge: true });

        // Also increment a global total for convenience
        const globalRef = doc(db, ANALYTICS_COL, 'global');
        await setDoc(globalRef, {
            totalVisits: increment(1)
        }, { merge: true });

    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}

/**
 * Tracks a specific post view.
 */
export async function trackPostView(postId: string, postTitle: string, coverImage?: string, slug?: string, createdAt?: number) {
    const postRef = doc(db, POST_VIEWS_COL, postId);
    try {
        await setDoc(postRef, {
            title: postTitle,
            coverImage: coverImage || '',
            slug: slug || '',
            createdAt: createdAt || null,
            views: increment(1),
            lastVisited: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error tracking post view:', error);
    }
}

/**
 * Gets daily stats for a specific range.
 */
export async function getDailyStats(): Promise<DailyStats[]> {
    const statsRef = doc(db, ANALYTICS_COL, DAILY_STATS_DOC);
    const snap = await getDoc(statsRef);
    if (!snap.exists()) return [];

    const data = snap.data();
    return Object.entries(data)
        .map(([date, visits]) => ({ date, visits: visits as number }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days
}

/**
 * Gets views by country.
 */
export async function getCountryStats(): Promise<CountryStat[]> {
    const countryRef = doc(db, ANALYTICS_COL, COUNTRIES_DOC);
    const snap = await getDoc(countryRef);
    if (!snap.exists()) return [];

    const data = snap.data();
    return Object.entries(data)
        .map(([country, count]) => ({ country, count: count as number }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Gets top 5 posts by views.
 */
export async function getTopPosts(max: number = 5): Promise<PostView[]> {
    const postsRef = collection(db, POST_VIEWS_COL);
    const q = query(postsRef, orderBy('views', 'desc'), limit(max));
    const snap = await getDocs(q);

    return snap.docs.map(doc => {
        const data = doc.data();
        return {
            postId: doc.id,
            title: data.title || 'Untitled', // Ensure title is always present
            coverImage: data.coverImage || '',
            slug: data.slug || '',
            createdAt: data.createdAt || null,
            views: data.views || 0
        } as PostView;
    });
}

/**
 * Helper to get visitor's country.
 */
export async function getVisitorCountry(): Promise<string> {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return data.country_name || 'Unknown';
    } catch {
        return 'Unknown';
    }
}
