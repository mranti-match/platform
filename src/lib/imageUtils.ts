/**
 * Compresses an image file client-side using Canvas.
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scaling logic
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Converts common cloud storage share links (Google Drive, Dropbox) 
 * into direct image URLs that can be used in <img> tags.
 */
export function getDirectCloudImageUrl(url: string): string {
    if (!url) return '';

    // 1. Google Drive
    // Supports: 
    // - https://drive.google.com/file/d/FILE_ID/view
    // - https://drive.google.com/open?id=FILE_ID
    // - https://drive.google.com/uc?id=FILE_ID
    const gdMatch = url.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]{25,})/);
    if (gdMatch && gdMatch[1]) {
        // Many patterns work, but lh3 is often the most stable for direct embedding
        return `https://lh3.googleusercontent.com/d/${gdMatch[1]}=w1000`;
    }

    // 2. Dropbox
    // Format: https://www.dropbox.com/s/TOKEN/image.png?dl=0
    if (url.includes('dropbox.com')) {
        if (url.includes('?dl=0')) {
            return url.replace('?dl=0', '?raw=1');
        } else if (!url.includes('?')) {
            return `${url}?raw=1`;
        }
    }

    return url;
}
