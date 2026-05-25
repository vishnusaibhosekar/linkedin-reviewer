import { createClient } from '@insforge/sdk';

// Use API key for backend routes (bypasses RLS for admin operations)
const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.INSFORGE_API_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

export { insforge };
