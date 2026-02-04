import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

/**
 * Uploads a file with progress tracking.
 */
export function uploadFileWithProgress(
    file: File,
    path: string,
    onProgress: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const storageRef = ref(storage, `${path}/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = snapshot.totalBytes > 0
                    ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    : 0;
                console.log(`Upload progress: ${progress.toFixed(2)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes})`);
                onProgress(progress);
            },
            (error) => {
                console.error('Upload failed with error:', error);
                reject(error);
            },
            async () => {
                console.log('Upload complete, fetching download URL...');
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
}
