// Shared storage keys and helpers for Structiva Enterprise OS
export const WORKERS_STORAGE_KEY = 'structiva_enterprise_workers_v1';
export const EXPENSES_STORAGE_KEY = 'structiva_enterprise_expenses_v2';

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
  type: 'Paid Leave' | 'Sick Leave' | 'Emergency / Casual' | 'Unauthorized';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  approvedBy?: string;
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
  status: 'Active' | 'Inactive' | 'On Leave';
  todayStatus: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
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
    todayStatus: 'Present',
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
        type: 'Paid Leave',
        startDate: '2026-10-18',
        endDate: '2026-10-21',
        days: 4,
        reason: 'Diwali Festival travel to hometown',
        status: 'Approved',
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
      },
      {
        id: 'act-3',
        date: '14 Nov 2026',
        time: '09:15 AM',
        type: 'Tool Checkout',
        description: 'Issued hydraulic rebar bender unit #04',
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
    todayStatus: 'Present',
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
    todayStatus: 'On Leave',
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
      },
      {
        id: 'doc-32',
        name: 'Safety & Heights Clearance Card',
        category: 'Safety Induction Certificate',
        uploadedAt: '12 Aug 2022',
        status: 'Verified',
        url: '#'
      }
    ],
    leaves: [
      {
        id: 'lv-31',
        type: 'Sick Leave',
        startDate: '2026-11-17',
        endDate: '2026-11-18',
        days: 2,
        reason: 'Viral fever rest advised by site clinic',
        status: 'Approved',
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
    recentActivities: [
      {
        id: 'act-31',
        date: 'Today',
        time: '07:30 AM',
        type: 'Safety Induction',
        description: 'Medical leave certificate verified & approved in system',
        site: 'Metro Line Piling'
      }
    ]
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
    todayStatus: 'Absent',
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
    documents: [
      {
        id: 'doc-41',
        name: 'Aadhaar Card Copy',
        category: 'Aadhaar Card',
        uploadedAt: '12 Sep 2024',
        status: 'Pending',
        url: '#'
      }
    ],
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
    recentActivities: [
      {
        id: 'act-41',
        date: 'Yesterday',
        time: '05:30 PM',
        type: 'Advance Disbursed',
        description: 'Received ₹500 weekly food advance voucher',
        site: 'Skyline Commercial Complex'
      }
    ]
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
    todayStatus: 'Present',
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
    recentActivities: [
      {
        id: 'act-51',
        date: 'Today',
        time: '08:10 AM',
        type: 'Site Check-in',
        description: 'Biometric fingerprint punched at Shed 3',
        site: 'Industrial Logistics Park'
      }
    ]
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
    todayStatus: 'Absent',
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
      // Merge with default schema structure to ensure newly added fields are present
      return parsed.map((item: any) => {
        const foundDefault = defaultEnterpriseWorkers.find(d => d.id === item.id);
        return {
          ...foundDefault,
          ...item,
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
  } catch (e) {
    console.error('Failed to save workers to localStorage:', e);
  }
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
