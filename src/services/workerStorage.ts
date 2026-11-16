// Shared storage keys and helpers for Structiva
export const WORKERS_STORAGE_KEY = 'structiva_enterprise_workers_v1';
export const EXPENSES_STORAGE_KEY = 'structiva_enterprise_expenses_v2';

export interface EnterpriseWorkerRecord {
  id: string;
  name: string;
  code: string;
  phone: string;
  category: 'Skilled' | 'Semi-Skilled' | 'Unskilled';
  skill: string;
  dailyWage: number;
  status: 'Active' | 'Inactive';
  assignedProject: string;
  avatar: string;
  emergencyContact: string;
  bloodGroup: string;
  safetyCertified: boolean;
  aadhaarNumber: string;
  totalDaysWorked: number;
}

export const defaultEnterpriseWorkers: EnterpriseWorkerRecord[] = [
  {
    id: '1',
    name: 'Ramesh Patil',
    code: 'WRK-MUM-104',
    phone: '+91 98220 12345',
    category: 'Skilled',
    skill: 'Master Bar Bender & Structural Mason',
    dailyWage: 950,
    status: 'Active',
    assignedProject: 'Skyline Commercial Complex',
    avatar: '/images/worker1.jpg',
    emergencyContact: '+91 94220 88771 (Wife)',
    bloodGroup: 'B+',
    safetyCertified: true,
    aadhaarNumber: 'XXXX-XXXX-8921',
    totalDaysWorked: 184
  },
  {
    id: '2',
    name: 'Suresh Kumar Yadav',
    code: 'WRK-DEL-209',
    phone: '+91 98220 54321',
    category: 'Semi-Skilled',
    skill: 'Shuttering Carpenter & Helper',
    dailyWage: 650,
    status: 'Active',
    assignedProject: 'Eastern Expressway Bridge',
    avatar: '/images/worker2.jpg',
    emergencyContact: '+91 91220 44332 (Brother)',
    bloodGroup: 'O+',
    safetyCertified: true,
    aadhaarNumber: 'XXXX-XXXX-3341',
    totalDaysWorked: 92
  },
  {
    id: '3',
    name: 'Ganesh More',
    code: 'WRK-PUN-302',
    phone: '+91 94220 99887',
    category: 'Skilled',
    skill: 'Heavy Crane & Tower Hoist Operator',
    dailyWage: 1200,
    status: 'Active',
    assignedProject: 'Metro Line Piling',
    avatar: '/images/worker3.jpg',
    emergencyContact: '+91 97220 11223 (Father)',
    bloodGroup: 'A+',
    safetyCertified: true,
    aadhaarNumber: 'XXXX-XXXX-6712',
    totalDaysWorked: 310
  },
  {
    id: '4',
    name: 'Santosh Yadav',
    code: 'WRK-UP-418',
    phone: '+91 91220 44556',
    category: 'Unskilled',
    skill: 'General Civil Material Handling',
    dailyWage: 500,
    status: 'Active',
    assignedProject: 'Skyline Commercial Complex',
    avatar: '/images/worker4.jpg',
    emergencyContact: '+91 99220 55667 (Cousin)',
    bloodGroup: 'AB+',
    safetyCertified: false,
    aadhaarNumber: 'XXXX-XXXX-1109',
    totalDaysWorked: 45
  }
];

export function getStoredWorkers(): EnterpriseWorkerRecord[] {
  if (typeof window === 'undefined') return defaultEnterpriseWorkers;
  try {
    const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(defaultEnterpriseWorkers));
      return defaultEnterpriseWorkers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEnterpriseWorkers;
  } catch {
    return defaultEnterpriseWorkers;
  }
}

export function saveWorkers(workers: EnterpriseWorkerRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(workers));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('workersUpdated', { detail: workers }));
  } catch (e) {
    console.error('Failed to save workers to localStorage:', e);
  }
}
