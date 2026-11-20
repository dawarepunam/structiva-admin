/**
 * Central Strapi API Client & Resilient Offline-Queue Manager for Structiva Enterprise OS
 * Integrates Next.js frontend with central Strapi backend (http://localhost:1337)
 * Implements real CRUD, offline synchronization queue, client IDs, and JWT management.
 */

export const STRAPI_BASE_URL = 
  process.env.NEXT_PUBLIC_STRAPI_URL || 
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 
  'http://localhost:1337';
const TOKEN_STORAGE_KEY = 'structiva_strapi_jwt';
const OFFLINE_QUEUE_KEY = 'structiva_offline_queue_v1';

export interface OfflineQueueItem<T = any> {
  id: string; // Client-side UUID
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  documentId?: string;
  data: Partial<T>;
  timestamp: string;
  status: 'Pending' | 'Syncing' | 'Failed';
  retryCount: number;
}

export async function getStrapiToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setStrapiToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('offlineQueueUpdated', { detail: queue }));
  } catch {}
}

export function addToOfflineQueue<T>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data: Partial<T>, documentId?: string): OfflineQueueItem {
  const item: OfflineQueueItem = {
    id: 'cli_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
    endpoint,
    method,
    documentId,
    data,
    timestamp: new Date().toISOString(),
    status: 'Pending',
    retryCount: 0
  };
  const current = getOfflineQueue();
  current.push(item);
  saveOfflineQueue(current);
  return item;
}

/**
 * Flush and synchronize pending offline queue items with Strapi
 */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      let success = false;
      if (item.method === 'POST') {
        const res = await createStrapiEntity(item.endpoint, item.data, false);
        success = !!res;
      } else if (item.method === 'PUT' && item.documentId) {
        success = await updateStrapiEntity(item.endpoint, item.documentId, item.data, false);
      } else if (item.method === 'DELETE' && item.documentId) {
        success = await deleteStrapiEntity(item.endpoint, item.documentId, false);
      }

      if (success) {
        synced++;
      } else {
        item.retryCount++;
        item.status = 'Failed';
        remaining.push(item);
        failed++;
      }
    } catch {
      item.retryCount++;
      item.status = 'Failed';
      remaining.push(item);
      failed++;
    }
  }

  saveOfflineQueue(remaining);
  return { synced, failed };
}

/**
 * Generic collection reader from Strapi v5
 */
export async function fetchStrapiCollection<T>(endpoint: string, fallbackData: T[] = []): Promise<T[]> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}?pagination[pageSize]=100`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return fallbackData;
    const json = await res.json();
    if (Array.isArray(json?.data) && json.data.length > 0) {
      return json.data as T[];
    }
    return fallbackData;
  } catch (err) {
    console.warn(`[Strapi Client] /api/${endpoint} offline, using fallback data`);
    return fallbackData;
  }
}

/**
 * Generic single entity reader
 */
export async function fetchStrapiEntity<T>(endpoint: string, documentId: string): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}/${documentId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

/**
 * Create an entity in Strapi with offline fallback queueing
 */
export async function createStrapiEntity<T>(endpoint: string, payload: Partial<T>, enableQueue = true): Promise<T | null> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: payload })
    });
    if (!res.ok) {
      if (enableQueue) addToOfflineQueue(endpoint, 'POST', payload);
      return null;
    }
    const json = await res.json();
    return json.data as T;
  } catch (err) {
    if (enableQueue) addToOfflineQueue(endpoint, 'POST', payload);
    return null;
  }
}

/**
 * Update an entity in Strapi
 */
export async function updateStrapiEntity<T>(endpoint: string, documentId: string, updates: Partial<T>, enableQueue = true): Promise<boolean> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}/${documentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data: updates })
    });
    if (!res.ok && enableQueue) {
      addToOfflineQueue(endpoint, 'PUT', updates, documentId);
    }
    return res.ok;
  } catch {
    if (enableQueue) addToOfflineQueue(endpoint, 'PUT', updates, documentId);
    return false;
  }
}

/**
 * Delete an entity in Strapi
 */
export async function deleteStrapiEntity(endpoint: string, documentId: string, enableQueue = true): Promise<boolean> {
  try {
    const token = await getStrapiToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${STRAPI_BASE_URL}/api/${endpoint}/${documentId}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok && enableQueue) {
      addToOfflineQueue(endpoint, 'DELETE', {}, documentId);
    }
    return res.ok;
  } catch {
    if (enableQueue) addToOfflineQueue(endpoint, 'DELETE', {}, documentId);
    return false;
  }
}
