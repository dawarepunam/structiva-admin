/**
 * Central Strapi API Client & Synchronizer for Structiva Enterprise OS
 * Integrates Next.js frontend with central Strapi backend (http://localhost:1337)
 * Provides automatic caching, JWT session management, and robust offline fallback.
 */

export const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const TOKEN_STORAGE_KEY = 'structiva_strapi_jwt';

export async function getStrapiToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setStrapiToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Generic fetcher for Strapi v5 endpoints
 */
export async function fetchStrapiCollection<T>(endpoint: string, fallbackData: T[] = []): Promise<T[]> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      return fallbackData;
    }
    const json = await res.json();
    if (Array.isArray(json?.data) && json.data.length > 0) {
      return json.data as T[];
    }
    return fallbackData;
  } catch (err) {
    console.warn(`[Strapi Client] Unable to connect to /api/${endpoint}, using resilient local store:`, err);
    return fallbackData;
  }
}

/**
 * Create an entity in Strapi
 */
export async function createStrapiEntity<T>(endpoint: string, payload: Partial<T>): Promise<T | null> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: payload })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.error(`[Strapi Client] Error creating entity in ${endpoint}:`, err);
    return null;
  }
}

/**
 * Update an entity in Strapi by documentId
 */
export async function updateStrapiEntity<T>(endpoint: string, documentId: string, updates: Partial<T>): Promise<boolean> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data: updates })
    });
    return res.ok;
  } catch (err) {
    console.error(`[Strapi Client] Error updating entity in ${endpoint}:`, err);
    return false;
  }
}

/**
 * Delete an entity in Strapi by documentId
 */
export async function deleteStrapiEntity(endpoint: string, documentId: string): Promise<boolean> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}/${documentId}`, {
      method: 'DELETE',
      headers
    });
    return res.ok;
  } catch (err) {
    console.error(`[Strapi Client] Error deleting entity in ${endpoint}:`, err);
    return false;
  }
}
