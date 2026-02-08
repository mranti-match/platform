import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject, listAll } from 'firebase/storage';
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
                onProgress(progress);
            },
            (error) => {
                console.error('Upload failed with error:', error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
}

/**
 * Deletes a file by its URL.
 */
export async function deleteFile(url: string) {
    if (!url) return;
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

/**
 * Deletes all files in a folder path.
 */
export async function deleteFolder(path: string) {
    if (!path) return;
    try {
        const folderRef = ref(storage, path);
        const listResult = await listAll(folderRef);

        const deletePromises = listResult.items.map(item => deleteObject(item));
        const folderPromises = listResult.prefixes.map(prefix => deleteFolder(prefix.fullPath));

        await Promise.all([...deletePromises, ...folderPromises]);
    } catch (error) {
        console.error('Error deleting folder:', error);
    }
}
