export const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;
export const SITE_URL = import.meta.env.VITE_SITE_URL;
export const SITE_NAME = 'My Store';

if (!DIRECTUS_URL) {
  throw new Error('VITE_DIRECTUS_URL environment variable is required but not set. Please set it in your .env file.');
}