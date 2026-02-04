import { ref, listAll, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from './firebase';

export interface MediaFile {
    name: string;
    url: string;
    path: string;
    type: string;
    size: number;
    updated: string;
}

export async function getAllMedia(path: string = 'posts/cover-images'): Promise<MediaFile[]> {
    try {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);

        const files = await Promise.all(result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);
            return {
                name: item.name,
                url,
                path: item.fullPath,
                type: metadata.contentType || 'image/jpeg',
                size: metadata.size,
                updated: metadata.updated
            };
        }));

        return files.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    } catch (error) {
        console.error('Error fetching media:', error);
        return [];
    }
}

export async function deleteMedia(fullPath: string) {
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
}
