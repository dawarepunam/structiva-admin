import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity, deleteStrapiEntity } from './strapiClient';

// Shared storage keys and helpers for Structiva Enterprise OS
export const WORKERS_STORAGE_KEY = 'structiva_enterprise_workers_v1';
export const EXPENSES_STORAGE_KEY = 'structiva_enterprise_expenses_v2';
export const ATTENDANCE_LOGS_STORAGE_KEY = 'structiva_enterprise_attendance_logs_v1';
export const LEAVES_STORAGE_KEY = 'structiva_enterprise_leaves_v1';

export interface WorkerDocument {
  id: string;
  name: string;
  category: 'Aadhaar Card' | 'Safety Induction Certificate' | 'Medical Fitness Certificate' | 'Trade Certificate' | 'Police Verification' | 'Bank Passbook';
  uploadedAt: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending' | 'Expiring Soon';
  url: string;
}

export interface WorkerLeaveRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerCode: string;
  type: 'Paid Leave' | 'Sick Leave' | 'Emergency / Casual' | 'Unauthorized';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface WorkerProjectAssignment {
  projectId: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: 'Current' | 'Completed' | 'Transferred';
  performanceRating: number; // 1-5
}

export interface WorkerActivityEvent {
  id: string;
  date: string;
  time: string;
  type: 'Site Check-in' | 'Tool Checkout' | 'Safety Induction' | 'Overtime Logged' | 'Advance Disbursed' | 'Certificate Verified';
  description: string;
  site: string;
}

export interface EnterpriseWorkerRecord {
  id: string;
  name: string;
  code: string;
  phone: string;
  category: 'Skilled' | 'Semi-Skilled' | 'Unskilled';
  skill: string;
  additionalSkills?: string[];
  dailyWage: number;
  overtimeHourlyRate: number;
  status: 'Active' | 'Inactive'; // Permanent employment status
  assignedProject: string;
  avatar: string;
  
  // Personal Details
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  hometown: string;
  aadhaarNumber: string;
  panNumber?: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyRelation: string;
  
  // Professional Details
  joiningDate: string;
  experienceYears: number;
  employmentType: 'Direct Payroll' | 'Subcontractor Crew' | 'Daily Muster';
  supervisorName: string;
  safetyCertified: boolean;
  inductionDate: string;
  
  // Bank & Payouts
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  paymentMode: 'Bank Transfer' | 'Direct Cash Voucher' | 'UPI';
  
  // Stats
  totalDaysWorked: number;
  presentDaysThisMonth: number;
  overtimeHoursThisMonth: number;
  advanceTakenThisMonth: number;
  
  // Detailed Collections
  documents: WorkerDocument[];
  leaves: WorkerLeaveRecord[];
  projectHistory: WorkerProjectAssignment[];
  recentActivities: WorkerActivityEvent[];
}

export interface AttendanceCheckInRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerCode: string;
  site: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Present' | 'Half Day' | 'Overtime' | 'Absent';
  verificationMethod: 'GPS + Geofence' | 'QR Code' | 'Supervisor Manual Overrule';
  latitude: number;
  longitude: number;
  distanceFromSiteMetres: number;
  gpsAccuracyMetres: number;
  geofencePassed: boolean;
  qrVerified: boolean;
  isException: boolean;
  exceptionReason?: string;
  approvalStatus: 'Auto-Verified' | 'Pending Exception Review' | 'Approved by Supervisor' | 'Rejected';
  supervisorRemark?: string;
  hoursWorked: number;
  wageEarned: number;
}

export const defaultEnterpriseWorkers: EnterpriseWorkerRecord[] = [
  {
    id: '1',
    name: 'Ramesh Patil',
    code: 'WRK-MUM-104',
    phone: '+91 98220 12345',
    category: 'Skilled',
    skill: 'Master Bar Bender & Structural Mason',
    additionalSkills: ['Rebar Tying', 'Post-Tensioning', 'Blueprint Reading'],
    dailyWage: 950,
    overtimeHourlyRate: 140,
    status: 'Active',
    assignedProject: 'Skyline Commercial Complex',
    avatar: '/images/worker1.jpg',
    dob: '1988-06-15',
    gender: 'Male',
    address: 'Room 14, Chawl No. 4, Kharadi Gaon, Pune, Maharashtra 411014',
    hometown: 'Satara, Maharashtra',
    aadhaarNumber: 'XXXX-XXXX-8921',
    panNumber: 'ABCDE1234F',
    bloodGroup: 'B+',
    emergencyContact: '+91 94220 88771',
    emergencyRelation: 'Sunita Patil (Wife)',
    joiningDate: '2023-04-10',
    experienceYears: 12,
    employmentType: 'Direct Payroll',
    supervisorName: 'Er. Rajesh Kulkarni',
    safetyCertified: true,
    inductionDate: '2023-04-12',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 4519',
    ifscCode: 'SBIN0004521',
    paymentMode: 'Bank Transfer',
    totalDaysWorked: 184,
    presentDaysThisMonth: 22,
    overtimeHoursThisMonth: 16,
    advanceTakenThisMonth: 2500,
    documents: [
      {
        id: 'doc-1',
        name: 'Aadhaar Card Copy (Verified)',
        category: 'Aadhaar Card',
        uploadedAt: '12 Apr 2023',
        status: 'Verified',
        url: '#'
      },
      {
        id: 'doc-2',
        name: 'EHS Construction Safety Level-2',
        category: 'Safety Induction Certificate',
        uploadedAt: '15 Apr 2023',
        expiryDate: '14 Apr 2027',
        status: 'Verified',
        url: '#'
      },
      {
        id: 'doc-3',
        name: 'Annual Site Medical Fitness Certificate',
        category: 'Medical Fitness Certificate',
        uploadedAt: '10 Jan 2026',
        expiryDate: '09 Jan 2027',
        status: 'Verified',
        url: '#'
      }
    ],
    leaves: [
      {
        id: 'lv-1',
        workerId: '1',
        workerName: 'Ramesh Patil',
        workerCode: 'WRK-MUM-104',
        type: 'Paid Leave',
        startDate: '2026-10-18',
        endDate: '2026-10-21',
        days: 4,
        reason: 'Diwali Festival travel to hometown',
        status: 'Approved',
        appliedOn: '10 Oct 2026',
        approvedBy: 'Er. Rajesh Kulkarni'
      }
    ],
    projectHistory: [
      {
        projectId: '1',
        projectName: 'Skyline Commercial Complex',
        role: 'Lead Steel Bar Bender & Mason',
        startDate: '01 Nov 2025',
        status: 'Current',
        performanceRating: 5
      },
      {
        projectId: '3',
        projectName: 'Metro Line Piling',
        role: 'Pier Reinforcement Fabricator',
        startDate: '15 Jan 2025',
        endDate: '28 Oct 2025',
        status: 'Completed',
        performanceRating: 4.8
      }
    ],
    recentActivities: [
      {
        id: 'act-1',
        date: 'Today',
        time: '07:58 AM',
        type: 'Site Check-in',
        description: 'Biometric fingerprint punched at Turnstile Gate B',
        site: 'Skyline Commercial Complex'
      },
      {
        id: 'act-2',
        date: 'Yesterday',
        time: '06:30 PM',
        type: 'Overtime Logged',
        description: 'Approved 2 hours overtime for 14th-floor slab rebar inspection',
        site: 'Skyline Commercial Complex'
      }
    ]
  },
  {
    id: '2',
    name: 'Suresh Kumar Yadav',
    code: 'WRK-DEL-209',
    phone: '+91 98220 54321',
    category: 'Semi-Skilled',
    skill: 'Shuttering Carpenter & Formwork Specialist',
    additionalSkills: ['Aluform Assembly', 'Scaffolding Staging', 'Ply Cutting'],
    dailyWage: 650,
    overtimeHourlyRate: 90,
    status: 'Active',
    assignedProject: 'Eastern Expressway Bridge',
    avatar: '/images/worker2.jpg',
    dob: '1994-02-10',
    gender: 'Male',
    address: 'Near Toll Plaza Camp, Sector 12, Navi Mumbai 400705',
    hometown: 'Gorakhpur, Uttar Pradesh',
    aadhaarNumber: 'XXXX-XXXX-3341',
    bloodGroup: 'O+',
    emergencyContact: '+91 91220 44332',
    emergencyRelation: 'Mahesh Yadav (Brother)',
    joiningDate: '2024-02-15',
    experienceYears: 6,
    employmentType: 'Subcontractor Crew',
    supervisorName: 'Er. Pravin Gaikwad',
    safetyCertified: true,
    inductionDate: '2024-02-18',
    bankName: 'Punjab National Bank',
    accountNumberMasked: '•••• •••• 9920',
    ifscCode: 'PUNB0123400',
    paymentMode: 'Direct Cash Voucher',
    totalDaysWorked: 92,
    presentDaysThisMonth: 19,
    overtimeHoursThisMonth: 8,
    advanceTakenThisMonth: 1000,
    documents: [
      {
        id: 'doc-21',
        name: 'Aadhaar Card Copy',
        category: 'Aadhaar Card',
        uploadedAt: '18 Feb 2024',
        status: 'Verified',
        url: '#'
      },
      {
        id: 'doc-22',
        name: 'Site Scaffold Erection Training',
        category: 'Safety Induction Certificate',
        uploadedAt: '20 Feb 2024',
        expiryDate: '19 Feb 2026',
        status: 'Expiring Soon',
        url: '#'
      }
    ],
    leaves: [],
    projectHistory: [
      {
        projectId: '2',
        projectName: 'Eastern Expressway Bridge',
        role: 'Deck Shuttering Carpenter',
        startDate: '15 Feb 2024',
        status: 'Current',
        performanceRating: 4.5
      }
    ],
    recentActivities: [
      {
        id: 'act-21',
        date: 'Today',
        time: '08:05 AM',
        type: 'Site Check-in',
        description: 'RFID badge detected at Pier Section P-14',
        site: 'Eastern Expressway Bridge'
      }
    ]
  },
  {
    id: '3',
    name: 'Ganesh More',
    code: 'WRK-PUN-302',
    phone: '+91 94220 99887',
    category: 'Skilled',
    skill: 'Heavy Crane & Tower Hoist Operator',
    additionalSkills: ['Potain Tower Crane', 'JCB Excavator', 'Rigging Safety'],
    dailyWage: 1200,
    overtimeHourlyRate: 180,
    status: 'Active',
    assignedProject: 'Metro Line Piling',
    avatar: '/images/worker3.jpg',
    dob: '1985-11-22',
    gender: 'Male',
    address: 'Survey 28, Katraj-Kondhwa Road, Pune 411046',
    hometown: 'Solapur, Maharashtra',
    aadhaarNumber: 'XXXX-XXXX-6712',
    panNumber: 'FGHIJ5678K',
    bloodGroup: 'A+',
    emergencyContact: '+91 97220 11223',
    emergencyRelation: 'Dattatray More (Father)',
    joiningDate: '2022-08-01',
    experienceYears: 15,
    employmentType: 'Direct Payroll',
    supervisorName: 'Er. Rajesh Kulkarni',
    safetyCertified: true,
    inductionDate: '2022-08-05',
    bankName: 'Bank of Baroda',
    accountNumberMasked: '•••• •••• 1088',
    ifscCode: 'BARB0KONDHW',
    paymentMode: 'Bank Transfer',
    totalDaysWorked: 310,
    presentDaysThisMonth: 18,
    overtimeHoursThisMonth: 24,
    advanceTakenThisMonth: 0,
    documents: [
      {
        id: 'doc-31',
        name: 'Heavy Commercial Rigging & Crane License',
        category: 'Trade Certificate',
        uploadedAt: '05 Aug 2022',
        expiryDate: '12 Nov 2028',
        status: 'Verified',
        url: '#'
      }
    ],
    leaves: [
      {
        id: 'lv-31',
        workerId: '3',
        workerName: 'Ganesh More',
        workerCode: 'WRK-PUN-302',
        type: 'Sick Leave',
        startDate: '2026-11-17',
        endDate: '2026-11-18',
        days: 2,
        reason: 'Viral fever rest advised by site clinic',
        status: 'Approved',
        appliedOn: '16 Nov 2026',
        approvedBy: 'Er. Rajesh Kulkarni'
      }
    ],
    projectHistory: [
      {
        projectId: '3',
        projectName: 'Metro Line Piling',
        role: 'Main Rig Crane Specialist',
        startDate: '10 Oct 2024',
        status: 'Current',
        performanceRating: 4.9
      }
    ],
    recentActivities: []
  },
  {
    id: '4',
    name: 'Santosh Yadav',
    code: 'WRK-UP-418',
    phone: '+91 91220 44556',
    category: 'Unskilled',
    skill: 'General Civil Material Handling & Site Labour',
    additionalSkills: ['Concrete Pouring Assistance', 'Curing', 'Debris Clearing'],
    dailyWage: 500,
    overtimeHourlyRate: 75,
    status: 'Active',
    assignedProject: 'Skyline Commercial Complex',
    avatar: '/images/worker4.jpg',
    dob: '1998-04-05',
    gender: 'Male',
    address: 'Labour Colony Block C, Kharadi, Pune 411014',
    hometown: 'Varanasi, Uttar Pradesh',
    aadhaarNumber: 'XXXX-XXXX-1109',
    bloodGroup: 'AB+',
    emergencyContact: '+91 99220 55667',
    emergencyRelation: 'Arun Yadav (Cousin)',
    joiningDate: '2024-09-10',
    experienceYears: 2,
    employmentType: 'Daily Muster',
    supervisorName: 'Er. Pravin Gaikwad',
    safetyCertified: false,
    inductionDate: '2024-09-12',
    bankName: 'Union Bank of India',
    accountNumberMasked: '•••• •••• 6523',
    ifscCode: 'UBIN0543210',
    paymentMode: 'Direct Cash Voucher',
    totalDaysWorked: 45,
    presentDaysThisMonth: 15,
    overtimeHoursThisMonth: 0,
    advanceTakenThisMonth: 500,
    documents: [],
    leaves: [],
    projectHistory: [
      {
        projectId: '1',
        projectName: 'Skyline Commercial Complex',
        role: 'Material Shifting Crew',
        startDate: '10 Sep 2024',
        status: 'Current',
        performanceRating: 3.8
      }
    ],
    recentActivities: []
  },
  {
    id: '5',
    name: 'Anil Sakpal',
    code: 'WRK-KOL-512',
    phone: '+91 98221 88990',
    category: 'Skilled',
    skill: 'Certified Commercial Welder (6G TIG/ARC)',
    additionalSkills: ['Gas Cutting', 'Structural Steel Fabrication', 'Radiography Testing Prep'],
    dailyWage: 1100,
    overtimeHourlyRate: 160,
    status: 'Active',
    assignedProject: 'Industrial Logistics Park',
    avatar: '/images/worker1.jpg',
    dob: '1990-08-19',
    gender: 'Male',
    address: 'Near MIDC Gate 2, Chakan, Pune 410501',
    hometown: 'Kolhapur, Maharashtra',
    aadhaarNumber: 'XXXX-XXXX-4501',
    bloodGroup: 'O+',
    emergencyContact: '+91 98220 77112',
    emergencyRelation: 'Sneha Sakpal (Wife)',
    joiningDate: '2023-11-01',
    experienceYears: 10,
    employmentType: 'Direct Payroll',
    supervisorName: 'Er. Rajesh Kulkarni',
    safetyCertified: true,
    inductionDate: '2023-11-05',
    bankName: 'HDFC Bank',
    accountNumberMasked: '•••• •••• 3481',
    ifscCode: 'HDFC0001824',
    paymentMode: 'Bank Transfer',
    totalDaysWorked: 140,
    presentDaysThisMonth: 21,
    overtimeHoursThisMonth: 12,
    advanceTakenThisMonth: 0,
    documents: [
      {
        id: 'doc-51',
        name: 'ASME 6G Welding Certification',
        category: 'Trade Certificate',
        uploadedAt: '05 Nov 2023',
        expiryDate: '04 Nov 2027',
        status: 'Verified',
        url: '#'
      }
    ],
    leaves: [],
    projectHistory: [
      {
        projectId: '4',
        projectName: 'Industrial Logistics Park',
        role: 'Pre-Engineered Building (PEB) Welder',
        startDate: '01 Nov 2023',
        status: 'Current',
        performanceRating: 4.9
      }
    ],
    recentActivities: []
  },
  {
    id: '6',
    name: 'Mohan Lal Verma',
    code: 'WRK-RAJ-604',
    phone: '+91 97220 33445',
    category: 'Semi-Skilled',
    skill: 'Commercial Electrician & Cable Jointer',
    additionalSkills: ['Conduit Laying', 'DB Panel Dressing', 'Earthing Pit Setup'],
    dailyWage: 750,
    overtimeHourlyRate: 110,
    status: 'Inactive',
    assignedProject: 'Unassigned',
    avatar: '/images/worker2.jpg',
    dob: '1995-12-03',
    gender: 'Male',
    address: 'Near Old Bus Stand, Bhosari, Pune 411026',
    hometown: 'Jaipur, Rajasthan',
    aadhaarNumber: 'XXXX-XXXX-9022',
    bloodGroup: 'B+',
    emergencyContact: '+91 98223 44112',
    emergencyRelation: 'Kailash Verma (Father)',
    joiningDate: '2024-05-10',
    experienceYears: 5,
    employmentType: 'Daily Muster',
    supervisorName: 'Er. Pravin Gaikwad',
    safetyCertified: true,
    inductionDate: '2024-05-12',
    bankName: 'Bank of India',
    accountNumberMasked: '•••• •••• 8840',
    ifscCode: 'BKID0001201',
    paymentMode: 'Direct Cash Voucher',
    totalDaysWorked: 60,
    presentDaysThisMonth: 0,
    overtimeHoursThisMonth: 0,
    advanceTakenThisMonth: 0,
    documents: [],
    leaves: [],
    projectHistory: [],
    recentActivities: []
  }
];

export const defaultAttendanceLogs: AttendanceCheckInRecord[] = [
  {
    id: 'att-101',
    workerId: '1',
    workerName: 'Ramesh Patil',
    workerCode: 'WRK-MUM-104',
    site: 'Skyline Commercial Complex',
    date: '17 Nov 2026',
    checkInTime: '07:58 AM',
    checkOutTime: '06:00 PM',
    status: 'Present',
    verificationMethod: 'GPS + Geofence',
    latitude: 18.55294,
    longitude: 73.93481,
    distanceFromSiteMetres: 24,
    gpsAccuracyMetres: 6,
    geofencePassed: true,
    qrVerified: true,
    isException: false,
    approvalStatus: 'Auto-Verified',
    hoursWorked: 8.0,
    wageEarned: 950
  },
  {
    id: 'att-102',
    workerId: '2',
    workerName: 'Suresh Kumar Yadav',
    workerCode: 'WRK-DEL-209',
    site: 'Eastern Expressway Bridge',
    date: '17 Nov 2026',
    checkInTime: '08:05 AM',
    checkOutTime: '01:00 PM',
    status: 'Half Day',
    verificationMethod: 'GPS + Geofence',
    latitude: 19.0330,
    longitude: 73.0297,
    distanceFromSiteMetres: 45,
    gpsAccuracyMetres: 8,
    geofencePassed: true,
    qrVerified: true,
    isException: false,
    approvalStatus: 'Auto-Verified',
    hoursWorked: 4.0,
    wageEarned: 325
  },
  {
    id: 'att-103',
    workerId: '4',
    workerName: 'Santosh Yadav',
    workerCode: 'WRK-UP-418',
    site: 'Skyline Commercial Complex',
    date: '17 Nov 2026',
    checkInTime: '08:45 AM',
    status: 'Present',
    verificationMethod: 'GPS + Geofence',
    latitude: 18.55620,
    longitude: 73.93910,
    distanceFromSiteMetres: 480, // Outside 100m geofence!
    gpsAccuracyMetres: 18,
    geofencePassed: false,
    qrVerified: false,
    isException: true,
    exceptionReason: 'Worker checked in 480m outside project boundary (Labour Camp gate instead of site turnstile)',
    approvalStatus: 'Pending Exception Review',
    hoursWorked: 8.0,
    wageEarned: 500
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
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any) => {
        const foundDefault = defaultEnterpriseWorkers.find(d => d.id === item.id);
        return {
          ...foundDefault,
          ...item,
          status: item.status === 'Inactive' ? 'Inactive' : 'Active',
          documents: item.documents || foundDefault?.documents || [],
          leaves: item.leaves || foundDefault?.leaves || [],
          projectHistory: item.projectHistory || foundDefault?.projectHistory || [],
          recentActivities: item.recentActivities || foundDefault?.recentActivities || []
        };
      });
    }
    return defaultEnterpriseWorkers;
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

    // Non-blocking sync to Strapi
    workers.forEach(w => {
      createStrapiEntity('workers', w).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save workers to localStorage:', e);
  }
}

export async function fetchWorkersFromBackend(): Promise<EnterpriseWorkerRecord[]> {
  try {
    const list = await fetchStrapiCollection<EnterpriseWorkerRecord>('workers', getStoredWorkers());
    if (list && list.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(list));
      }
      return list;
    }
  } catch {}
  return getStoredWorkers();
}

export function getStoredAttendanceLogs(): AttendanceCheckInRecord[] {
  if (typeof window === 'undefined') return defaultAttendanceLogs;
  try {
    const raw = localStorage.getItem(ATTENDANCE_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_LOGS_STORAGE_KEY, JSON.stringify(defaultAttendanceLogs));
      return defaultAttendanceLogs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAttendanceLogs;
  } catch {
    return defaultAttendanceLogs;
  }
}

export function saveAttendanceLogs(logs: AttendanceCheckInRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTENDANCE_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('attendanceUpdated', { detail: logs }));

    // Non-blocking sync to Strapi
    logs.forEach(l => {
      createStrapiEntity('attendances', l).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save attendance logs:', e);
  }
}

export async function fetchAttendanceFromBackend(): Promise<AttendanceCheckInRecord[]> {
  try {
    const list = await fetchStrapiCollection<AttendanceCheckInRecord>('attendances', getStoredAttendanceLogs());
    if (list && list.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ATTENDANCE_LOGS_STORAGE_KEY, JSON.stringify(list));
      }
      return list;
    }
  } catch {}
  return getStoredAttendanceLogs();
}

export function getWorkerById(id: string): EnterpriseWorkerRecord | undefined {
  const workers = getStoredWorkers();
  return workers.find(w => w.id === id);
}

export function updateWorker(id: string, updates: Partial<EnterpriseWorkerRecord>): EnterpriseWorkerRecord[] {
  const workers = getStoredWorkers();
  const updated = workers.map(w => {
    if (w.id === id) {
      return { ...w, ...updates };
    }
    return w;
  });
  saveWorkers(updated);
  return updated;
}
