import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from './strapiClient';
import { getStoredWorkers, saveWorkers, EnterpriseWorkerRecord } from './workerStorage';

export const CORRECTIONS_STORAGE_KEY = 'structiva_enterprise_profile_corrections_v1';

export interface ProfileCorrectionRecord {
  id: string | number;
  documentId?: string;
  userRole: 'Worker' | 'Supervisor';
  workerId: string;
  workerName: string;
  workerCode: string;
  project: string;
  site: string;
  supervisorName: string;
  fieldName: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  isPhotoChange?: boolean;
  oldPhotoUrl?: string;
  newPhotoUrl?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
  reviewedBy?: string;
  submittedDate: string;
  reviewedDate?: string;
}

export type WorkerProfileCorrectionRecord = ProfileCorrectionRecord;

export const DEFAULT_CORRECTIONS: ProfileCorrectionRecord[] = [
  {
    id: 'cor-101',
    userRole: 'Worker',
    workerId: '1',
    workerName: 'Ramesh Patil',
    workerCode: 'WRK-MUM-104',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A Core & Podium',
    supervisorName: 'Er. Pravin Gaikwad',
    fieldName: 'phone',
    fieldLabel: 'Mobile Phone Number',
    oldValue: '+91 98220 12345',
    newValue: '+91 98220 99441',
    isPhotoChange: false,
    reason: 'Updated primary contact phone number due to SIM card upgrade.',
    status: 'Pending',
    submittedDate: '19 Nov 2026'
  },
  {
    id: 'cor-102',
    userRole: 'Worker',
    workerId: '1',
    workerName: 'Ramesh Patil',
    workerCode: 'WRK-MUM-104',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A Core & Podium',
    supervisorName: 'Er. Pravin Gaikwad',
    fieldName: 'avatar',
    fieldLabel: 'Official Profile Photo',
    oldValue: '/images/workers/ramesh_patil.jpg',
    newValue: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23167C72"/><text x="50%" y="55%" font-size="40" font-weight="bold" fill="%23FFFFFF" text-anchor="middle" dominant-baseline="middle">RP</text></svg>',
    isPhotoChange: true,
    oldPhotoUrl: '/images/workers/ramesh_patil.jpg',
    newPhotoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23167C72"/><text x="50%" y="55%" font-size="40" font-weight="bold" fill="%23FFFFFF" text-anchor="middle" dominant-baseline="middle">RP</text></svg>',
    reason: 'Updated clear passport size digital headshot for safety badge verification.',
    status: 'Pending',
    submittedDate: '18 Nov 2026'
  },
  {
    id: 'cor-201',
    userRole: 'Supervisor',
    workerId: 'sup-1',
    workerName: 'Er. Pravin Gaikwad',
    workerCode: 'SUP-PUN-01',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A Core & Podium',
    supervisorName: 'Er. Rajesh Kulkarni (Project Director)',
    fieldName: 'phone',
    fieldLabel: 'Official Mobile Phone',
    oldValue: '+91 98220 11432',
    newValue: '+91 98220 99441',
    isPhotoChange: false,
    reason: 'Field emergency priority number activated for Skyline tower inspection.',
    status: 'Pending',
    submittedDate: '20 Nov 2026'
  }
];

export function getStoredCorrections(): ProfileCorrectionRecord[] {
  if (typeof window === 'undefined') return DEFAULT_CORRECTIONS;
  try {
    const raw = localStorage.getItem(CORRECTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CORRECTIONS_STORAGE_KEY, JSON.stringify(DEFAULT_CORRECTIONS));
      return DEFAULT_CORRECTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CORRECTIONS;
  } catch {
    return DEFAULT_CORRECTIONS;
  }
}

export function saveStoredCorrections(corrections: ProfileCorrectionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CORRECTIONS_STORAGE_KEY, JSON.stringify(corrections));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('correctionsUpdated', { detail: corrections }));
  } catch (e) {
    console.error('Failed to save corrections:', e);
  }
}

export async function fetchCorrectionsFromBackend(): Promise<ProfileCorrectionRecord[]> {
  try {
    const backendData = await fetchStrapiCollection<any>('worker-profile-corrections', []);
    const local = getStoredCorrections();

    if (backendData && backendData.length > 0) {
      const formatted: ProfileCorrectionRecord[] = backendData.map((d: any) => ({
        id: d.id || d.documentId,
        documentId: d.documentId,
        userRole: d.userRole || 'Worker',
        workerId: d.workerId,
        workerName: d.workerName,
        workerCode: d.workerCode,
        project: d.project,
        site: d.site,
        supervisorName: d.supervisorName,
        fieldName: d.fieldName,
        fieldLabel: d.fieldLabel,
        oldValue: d.oldValue,
        newValue: d.newValue,
        isPhotoChange: d.isPhotoChange,
        oldPhotoUrl: d.oldPhotoUrl,
        newPhotoUrl: d.newPhotoUrl,
        reason: d.reason,
        status: d.status || 'Pending',
        adminRemarks: d.adminRemarks,
        reviewedBy: d.reviewedBy,
        submittedDate: d.submittedDate,
        reviewedDate: d.reviewedDate
      }));

      const combined = [...local];
      formatted.forEach(f => {
        const idx = combined.findIndex(c => String(c.id) === String(f.id) || (c.documentId && c.documentId === f.documentId));
        if (idx >= 0) {
          combined[idx] = f;
        } else {
          combined.unshift(f);
        }
      });
      saveStoredCorrections(combined);
      return combined;
    }
    return local;
  } catch {
    return getStoredCorrections();
  }
}

export async function submitProfileCorrection(
  payload: Omit<ProfileCorrectionRecord, 'id' | 'status'>
): Promise<ProfileCorrectionRecord> {
  const newRecord: ProfileCorrectionRecord = {
    ...payload,
    id: `cor-${Date.now()}`,
    status: 'Pending'
  };

  const existing = getStoredCorrections();
  const updated = [newRecord, ...existing];
  saveStoredCorrections(updated);

  try {
    const strapiRes = await createStrapiEntity<any>('worker-profile-corrections', newRecord);
    if (strapiRes && (strapiRes.id || strapiRes.documentId)) {
      newRecord.documentId = strapiRes.documentId;
      newRecord.id = strapiRes.id || newRecord.id;
      saveStoredCorrections([newRecord, ...existing]);
    }
  } catch (err) {
    console.warn('Strapi async sync queued for profile correction:', err);
  }

  return newRecord;
}

export const submitWorkerProfileCorrection = submitProfileCorrection;

export async function reviewWorkerProfileCorrection(
  correctionId: string | number,
  decision: 'Approved' | 'Rejected',
  adminRemarks: string,
  reviewedBy: string = 'Executive HR Admin'
): Promise<boolean> {
  const allCorrections = getStoredCorrections();
  const targetIndex = allCorrections.findIndex(c => String(c.id) === String(correctionId) || (c.documentId && c.documentId === correctionId));
  if (targetIndex === -1) return false;

  const target = allCorrections[targetIndex];
  if (target.status !== 'Pending') {
    return false;
  }

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const updatedTarget: ProfileCorrectionRecord = {
    ...target,
    status: decision,
    adminRemarks: adminRemarks || (decision === 'Approved' ? 'Verified and authorized by Executive HR Admin.' : 'Rejected per compliance policy.'),
    reviewedBy,
    reviewedDate: todayStr
  };

  allCorrections[targetIndex] = updatedTarget;
  saveStoredCorrections(allCorrections);

  // If approved and it is a Worker, update official Worker record
  if (decision === 'Approved' && target.userRole === 'Worker') {
    const workers = getStoredWorkers();
    const workerIndex = workers.findIndex(w => String(w.id) === String(target.workerId) || w.code === target.workerCode);
    if (workerIndex >= 0) {
      const currentWorker = workers[workerIndex];
      const field = target.fieldName as keyof EnterpriseWorkerRecord;

      if (target.isPhotoChange && target.newPhotoUrl) {
        currentWorker.avatar = target.newPhotoUrl;
      } else if (field && field in currentWorker) {
        (currentWorker as any)[field] = target.newValue;
      }
      workers[workerIndex] = { ...currentWorker };
      saveWorkers(workers);

      try {
        const docId = (currentWorker as any).documentId;
        if (docId) {
          updateStrapiEntity('workers', docId, {
            [target.isPhotoChange ? 'avatar' : target.fieldName]: target.isPhotoChange ? target.newPhotoUrl : target.newValue
          }).catch(() => {});
        }
      } catch {}
    }
  }

  // Sync decision to Strapi
  try {
    if (target.documentId) {
      await updateStrapiEntity('worker-profile-corrections', target.documentId, {
        status: decision,
        adminRemarks: updatedTarget.adminRemarks,
        reviewedBy,
        reviewedDate: todayStr
      });
    }
  } catch {}

  return true;
}
