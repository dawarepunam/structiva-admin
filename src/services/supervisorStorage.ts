export interface SupervisorOption {
  id: string;
  name: string;
  supervisorId: string;
  role: string;
  email?: string;
}

export const DEFAULT_SUPERVISORS: SupervisorOption[] = [
  { id: 'sup-1', name: 'Er. Pravin Gaikwad', supervisorId: 'SUP-PUN-01', role: 'Chief Site Operations Supervisor' },
  { id: 'sup-2', name: 'Er. Rajesh Kulkarni', supervisorId: 'SUP-PUN-02', role: 'Senior Project Execution Supervisor' },
  { id: 'sup-3', name: 'Er. Vikram Deshmukh', supervisorId: 'SUP-MUM-03', role: 'Infrastructure Field Supervisor' },
  { id: 'sup-4', name: 'Er. Santosh Jadhav', supervisorId: 'SUP-PUN-04', role: 'Machinery & Fuel Operations Lead' },
  { id: 'sup-5', name: 'Er. Sunil Rao', supervisorId: 'SUP-PUN-05', role: 'Site Execution Supervisor' },
  { id: 'sup-6', name: 'Er. Amit Shinde', supervisorId: 'SUP-PUN-06', role: 'Civil Works Supervisor' }
];

export function getStoredSupervisors(): SupervisorOption[] {
  if (typeof window === 'undefined') return DEFAULT_SUPERVISORS;
  try {
    const raw = localStorage.getItem('structiva_enterprise_supervisors_v1');
    if (!raw) {
      localStorage.setItem('structiva_enterprise_supervisors_v1', JSON.stringify(DEFAULT_SUPERVISORS));
      return DEFAULT_SUPERVISORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUPERVISORS;
  } catch {
    return DEFAULT_SUPERVISORS;
  }
}
