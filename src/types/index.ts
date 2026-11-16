export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  budget: number;
  spent: number;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  progress: number;
  startDate: string;
  expectedCompletion: string;
}

export interface Worker {
  id: string;
  name: string;
  code: string;
  phone: string;
  category: 'Skilled' | 'Semi-Skilled' | 'Unskilled';
  skill: string;
  dailyWage: number;
  status: 'Active' | 'Inactive';
  assignedProject: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  status: 'Present' | 'Half Day' | 'Absent' | 'Overtime';
  overtimeHours?: number;
  site: string;
}

export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: 'JCB / Excavator' | 'Dumper' | 'Tractor' | 'Crane' | 'Truck' | 'Jeep';
  currentStatus: 'On Site' | 'Idle' | 'Under Maintenance';
  assignedDriver: string;
  operatingHoursOrKm: number;
}

export interface FuelLog {
  id: string;
  vehicleName: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  fuelType: 'Diesel' | 'Petrol';
  meterReading: number;
  receiptNumber: string;
}

export interface SiteExpense {
  id: string;
  title: string;
  category: 'Labour' | 'Fuel' | 'Materials' | 'Logistics' | 'Maintenance' | 'Petty Cash';
  amount: number;
  date: string;
  submittedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptUrl?: string;
}
