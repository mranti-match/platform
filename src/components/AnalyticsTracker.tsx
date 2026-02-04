'use client';

import { useEffect } from 'react';
import { trackVisit, getVisitorCountry } from '@/lib/analytics';

export default function AnalyticsTracker() {
    useEffect(() => {
        const track = async () => {
            // Check if we've already tracked this session to avoid double counting on re-renders
            if (sessionStorage.getItem('visited')) return;

            try {
                const country = await getVisitorCountry();
                await trackVisit(country);
                sessionStorage.setItem('visited', 'true');
            } catch (error) {
                console.error('Failed to track visit:', error);
            }
        };
        track();
    }, []);

    return null; // This component doesn't render anything
}
