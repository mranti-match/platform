'use client';

import { useEffect } from 'react';
import { incrementViews } from '@/lib/posts';
import { trackPostView } from '@/lib/analytics';

export default function ViewTracker({ postId, postTitle, coverImage, slug, createdAt }: { postId: string, postTitle: string, coverImage?: string, slug?: string, createdAt?: number }) {
    useEffect(() => {
        if (postId) {
            incrementViews(postId);
            trackPostView(postId, postTitle, coverImage, slug, createdAt);
        }
    }, [postId, postTitle, coverImage, slug, createdAt]);

    return null;
}
