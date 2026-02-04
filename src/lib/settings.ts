import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    adminEmail: string;
    socialLinks: {
        linkedin?: string;
        facebook?: string;
        instagram?: string;
    };
    heroLabel: string;
    heroTitle: string;
    heroSubtitle: string;
}

const SETTINGS_DOC_ID = 'global_settings';
const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

export const DEFAULT_SETTINGS: SiteSettings = {
    siteTitle: 'DR AFNIZANFAIZAL',
    siteDescription: 'Inspiring future through advanced AI solutions, from predictive analytics to autonomous systems.',
    adminEmail: '',
    socialLinks: {
        linkedin: '',
        facebook: '',
        instagram: ''
    },
    heroLabel: 'STRATEGIC AI ECOSYSTEM SPECIALIST',
    heroTitle: 'DR AFNIZANFAIZAL',
    heroSubtitle: 'Inspiring future through advanced AI solutions, from predictive analytics to autonomous systems, that deliver measurable results.'
};

export async function getSettings(): Promise<SiteSettings> {
    try {
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
            return snap.data() as SiteSettings;
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateSettings(settings: Partial<SiteSettings>) {
    try {
        const current = await getSettings();
        await setDoc(settingsRef, { ...current, ...settings }, { merge: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}
