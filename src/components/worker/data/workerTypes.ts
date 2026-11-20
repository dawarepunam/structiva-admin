export interface WorkerProfile {
  id: number;
  documentId?: string;
  workerId: string;
  code: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  pin?: string;
  category: 'Skilled' | 'Semi-Skilled' | 'Unskilled';
  skill: string;
  additionalSkills?: string[];
  dailyWage: number;
  overtimeHourlyRate: number;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  accountStatus?: string;
  assignedProject: string;
  assignedSite?: string;
  avatar?: string;
  dob?: string;
  gender?: string;
  address?: string;
  hometown?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyRelation?: string;
  joiningDate?: string;
  experienceYears?: number;
  employmentType?: string;
  supervisorName?: string;
  safetyCertified?: boolean;
  inductionDate?: string;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  paymentMode?: string;
  totalDaysWorked?: number;
  presentDaysThisMonth?: number;
  overtimeHoursThisMonth?: number;
  advanceTakenThisMonth?: number;
  documents?: WorkerDocumentItem[];
  leaves?: WorkerLeaveItem[];
}

export interface WorkerDocumentItem {
  id: string;
  name: string;
  category: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  url: string;
}

export interface WorkerLeaveItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

export interface WorkerTaskRecord {
  id: number;
  documentId?: string;
  document_id?: string;
  taskId?: string;
  title: string;
  project: string;
  site?: string;
  category: string;
  priority: 'Critical' | 'High' | 'Standard' | 'Low';
  status: 'Assigned' | 'In Progress' | 'Resolution Submitted' | 'Completed' | 'Not Started';
  details?: any;
  remarks?: string;
  adminRemarks?: string;
  submittedBy?: string;
  submittedDate?: string;
  assignedSupervisor?: string;
  assignedWorkerId?: number;
  assignedWorkerName?: string;
  workerRemarks?: string;
  workImpact?: string;
  exactLocation?: string;
  completedQuantity?: number;
  unit?: string;
}

export interface WorkerAttendanceRecord {
  id: number;
  workerId: string;
  workerName: string;
  workerCode: string;
  site: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'Present' | 'Half Day' | 'Absent' | 'On Leave';
  verificationMethod?: string;
  hoursWorked?: number;
  wageEarned?: number;
  geofencePassed?: boolean;
  isException?: boolean;
}

export interface WorkerAdvanceRecord {
  id: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  disbursedAmount?: number;
  recoveryInstalments?: string;
  remarks?: string;
}

export interface WorkerSafetyIncident {
  id: string;
  title: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  incidentTime: string;
  status: 'Submitted' | 'In Progress' | 'Resolved' | 'Closed';
  description: string;
  immediateActionTaken?: string;
  safetyOfficerRemarks?: string;
}

export interface WorkerSupportTicket {
  id: string;
  subject: string;
  category: 'Wages' | 'Safety' | 'Accommodation' | 'Tools' | 'General';
  status: 'Open' | 'In Progress' | 'Resolved';
  submittedDate: string;
  description: string;
  adminResponse?: string;
}
