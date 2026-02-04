import { rtdb } from './firebase';
import { ref, get, child } from 'firebase/database';

export interface Product {
    id: string;
    product_name: string;
    product_description: string;
    company_name: string;
    company_email?: string;
    company_address?: string;
    category?: string[];
    program?: string;
    image_url?: string;
}

export async function getAllProducts(): Promise<Product[]> {
    const dbRef = ref(rtdb);
    try {
        let snapshot = await get(child(dbRef, 'products'));

        if (!snapshot.exists()) {
            console.log('No data at "products", trying root...');
            snapshot = await get(dbRef);
        }

        if (snapshot.exists()) {
            const data = snapshot.val();

            // Check if products are nested under a 'products' key
            const productsData = data.products || data;

            // If it's still not an object/array, return empty
            if (!productsData || typeof productsData !== 'object') return [];

            // If productsData is an array, convert to entries
            const rawEntries = Array.isArray(productsData)
                ? productsData.map((item, index) => [index.toString(), item])
                : Object.entries(productsData);

            const entries = rawEntries as [string, any][];

            return entries
                .filter(([_, item]) => item && typeof item === 'object')
                .map(([id, product]) => {
                    // Map Title Case keys to our expected snake_case keys
                    const mappedProduct = {
                        id: String(product.id || id),
                        product_name: product["Product Name"] || product.product_name || product.name || 'Untitled Product',
                        product_description: product["Product Description"] || product.product_description || product.description || '',
                        company_name: product["Company Name"] || product.company_name || product.company || 'Unknown Company',
                        company_email: product["Business Email"] || product.company_email,
                        company_address: product["Business Address"] || product.company_address,
                        image_url: product["Cover Image"] || product.image_url,
                        category: product["Category"] || product.category,
                        program: product["Programme"] || product.program,
                        ...product
                    };
                    return mappedProduct;
                })
                .filter(p => p.product_name !== 'Untitled Product') as Product[];
        }
        return [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    const dbRef = ref(rtdb);
    try {
        // Try direct path
        let snapshot = await get(child(dbRef, `products/${id}`));

        // Try root path if primary fails
        if (!snapshot.exists()) {
            const rootSnapshot = await get(child(dbRef, id)); // Try root/[id]
            if (rootSnapshot.exists()) {
                snapshot = rootSnapshot;
            }
        }

        if (snapshot.exists()) {
            const val = snapshot.val();
            return {
                id,
                product_name: val["Product Name"] || val.product_name || val.name || 'Untitled Product',
                product_description: val["Product Description"] || val.product_description || val.description || '',
                company_name: val["Company Name"] || val.company_name || val.company || 'Unknown Company',
                company_email: val["Business Email"] || val.company_email,
                company_address: val["Business Address"] || val.company_address,
                image_url: val["Cover Image"] || val.image_url,
                category: val["Category"] || val.category,
                program: val["Programme"] || val.program,
                ...val
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}
