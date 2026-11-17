// Shared storage keys and helpers for Structiva Enterprise Fleet & Heavy Machinery
export const FLEET_STORAGE_KEY = 'structiva_enterprise_fleet_v1';

export interface AssetDocument {
  id: string;
  name: string;
  category: 'Registration Certificate (RC)' | 'Insurance Policy' | 'PUC Certificate' | 'Fitness Certificate' | 'Load Test Certificate' | 'Rental Agreement';
  uploadedAt: string;
  expiryDate?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  url: string;
}

export interface AssetMaintenanceRecord {
  id: string;
  type: 'Preventive Service' | 'Breakdown Repair' | 'Hydraulic Oil Change' | 'Emergency Repair';
  date: string;
  meterReadingHoursOrKm: number;
  description: string;
  sparePartsUsed: string[];
  vendorWorkshop: string;
  cost: number;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  technicianName: string;
}

export interface AssetInspectionRecord {
  id: string;
  date: string;
  inspectorName: string;
  inspectionType: 'Pre-Start Daily Checklist' | 'Weekly EHS Safety Audit' | 'Post-Operation Check';
  hydraulicsOk: boolean;
  brakesOk: boolean;
  engineOilOk: boolean;
  tracksOrTyresOk: boolean;
  lightsAndHornOk: boolean;
  fireExtinguisherOk: boolean;
  status: 'Passed' | 'Action Required' | 'Critical Failure';
  remarks: string;
}

export interface AssetAssignmentHistory {
  id: string;
  projectName: string;
  siteLocation: string;
  startDate: string;
  endDate?: string;
  operatorName: string;
  status: 'Current' | 'Completed' | 'Demobilized';
}

export interface AssetFuelLog {
  id: string;
  date: string;
  litres: number;
  rate: number;
  totalCost: number;
  meterReading: string;
  pumpName: string;
  receiptNumber: string;
  supervisorName: string;
}

export interface EnterpriseAssetRecord {
  id: string;
  name: string;
  code: string;
  registrationNumber: string;
  serialNumber: string;
  assetClass: 'Heavy Machinery' | 'Commercial Vehicle';
  category: 'Excavator / Backhoe' | 'Dumper / Tipper' | 'Hydraulic Crane' | 'Tower Crane' | 'Transit Mixer' | 'Water Tanker' | 'Road Roller' | 'Pickup Truck';
  manufacturer: string;
  model: string;
  manufacturingYear: number;
  ownershipType: 'Company Owned' | 'Rented / Hired';
  rentalVendor?: string;
  rentalRatePerDay?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  
  currentStatus: 'Operational (On Site)' | 'Under Maintenance' | 'Standby (Yard)' | 'Breakdown Alert';
  currentProject: string;
  assignedOperator: string;
  operatorPhone: string;
  operatorLicence: string;
  
  // Telematics & Meter
  meterUnit: 'Hours' | 'Kilometres';
  operatingHoursOrKm: number;
  serviceDueAtHoursOrKm: number;
  telematicsStatus: 'GPS Connected' | 'Device Offline' | 'Tracking Unavailable';
  telematicsImei: string;
  lastKnownCoordinates?: { lat: number; lng: number };
  
  // Fuel & Specs
  fuelType: 'Diesel (High Cetane)' | 'Petrol' | 'CNG';
  fuelTankCapacityLitres: number;
  averageConsumption: string;
  engineNumber: string;
  operatingCapacity: string;
  image: string;
  
  // Financials
  purchaseCost?: number;
  totalMaintenanceCost: number;
  totalFuelCost: number;
  
  // Collections
  documents: AssetDocument[];
  maintenanceRecords: AssetMaintenanceRecord[];
  inspections: AssetInspectionRecord[];
  assignmentHistory: AssetAssignmentHistory[];
  fuelLogs: AssetFuelLog[];
}

export const defaultEnterpriseFleet: EnterpriseAssetRecord[] = [
  {
    id: '1',
    name: 'JCB 3DX Super EcoXcellence Backhoe',
    code: 'AST-JCB-01',
    registrationNumber: 'MH 12 AB 4590',
    serialNumber: 'JCB-3DX-2023-88219',
    assetClass: 'Heavy Machinery',
    category: 'Excavator / Backhoe',
    manufacturer: 'JCB India Ltd',
    model: '3DX Super EcoXcellence 4WD',
    manufacturingYear: 2023,
    ownershipType: 'Company Owned',
    currentStatus: 'Operational (On Site)',
    currentProject: 'Skyline Commercial Complex',
    assignedOperator: 'Santosh Shinde',
    operatorPhone: '+91 98220 33411',
    operatorLicence: 'DL-09-2018-HMV',
    meterUnit: 'Hours',
    operatingHoursOrKm: 1420,
    serviceDueAtHoursOrKm: 1500, // 80 hrs left
    telematicsStatus: 'GPS Connected',
    telematicsImei: '864291038472910',
    lastKnownCoordinates: { lat: 18.55294, lng: 73.93481 },
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 128,
    averageConsumption: '4.8 Litres / Hour',
    engineNumber: '448DI-ECO-99120',
    operatingCapacity: '1.1 m³ Shovel / 0.26 m³ Excavator',
    image: '/images/jcb_real.jpg',
    purchaseCost: 3850000,
    totalMaintenanceCost: 114500,
    totalFuelCost: 284000,
    documents: [
      {
        id: 'doc-1',
        name: 'Commercial Vehicle Registration Certificate (RC)',
        category: 'Registration Certificate (RC)',
        uploadedAt: '15 Mar 2023',
        status: 'Valid',
        url: '#'
      },
      {
        id: 'doc-2',
        name: 'Commercial Equipment Comprehensive Insurance',
        category: 'Insurance Policy',
        uploadedAt: '12 Oct 2025',
        expiryDate: '14 Oct 2027',
        status: 'Valid',
        url: '#'
      },
      {
        id: 'doc-3',
        name: 'RTO Annual Fitness Certificate',
        category: 'Fitness Certificate',
        uploadedAt: '10 Feb 2026',
        expiryDate: '09 Feb 2027',
        status: 'Valid',
        url: '#'
      }
    ],
    maintenanceRecords: [
      {
        id: 'maint-1',
        type: 'Preventive Service',
        date: '02 Nov 2026',
        meterReadingHoursOrKm: 1350,
        description: 'Scheduled 1250-hr full service: engine oil, primary/secondary diesel filters, air cleaner replacement.',
        sparePartsUsed: ['15W40 Engine Oil (14L)', 'Diesel Filter Element', 'Hydraulic Strainer Cleaned'],
        vendorWorkshop: 'JCB Authorized Central Dealership Pune',
        cost: 16500,
        status: 'Completed',
        technicianName: 'Sanjay Deshmukh'
      }
    ],
    inspections: [
      {
        id: 'insp-1',
        date: '17 Nov 2026',
        inspectorName: 'Er. Pravin Gaikwad',
        inspectionType: 'Pre-Start Daily Checklist',
        hydraulicsOk: true,
        brakesOk: true,
        engineOilOk: true,
        tracksOrTyresOk: true,
        lightsAndHornOk: true,
        fireExtinguisherOk: true,
        status: 'Passed',
        remarks: 'All cylinders responsive. Zero hydraulic oil leakage detected around swing arm.'
      }
    ],
    assignmentHistory: [
      {
        id: 'asg-1',
        projectName: 'Skyline Commercial Complex',
        siteLocation: 'Kharadi IT Park, Pune',
        startDate: '10 Jan 2026',
        operatorName: 'Santosh Shinde',
        status: 'Current'
      }
    ],
    fuelLogs: [
      {
        id: 'fl-1',
        date: '16 Nov 2026',
        litres: 60,
        rate: 92.5,
        totalCost: 5550,
        meterReading: '1,420 hrs',
        pumpName: 'Indian Oil Highway Petro Centre #991',
        receiptNumber: 'IOCL-INV-88219',
        supervisorName: 'Er. Pravin Gaikwad'
      }
    ]
  },
  {
    id: '2',
    name: 'Tata Prima 2830.K Heavy Tipper 16m³',
    code: 'AST-TIP-02',
    registrationNumber: 'MH 14 CD 7821',
    serialNumber: 'TATA-PRIMA-2830K-41092',
    assetClass: 'Commercial Vehicle',
    category: 'Dumper / Tipper',
    manufacturer: 'Tata Motors Commercial Vehicles',
    model: 'Prima 2830.K Heavy Duty Bogie',
    manufacturingYear: 2022,
    ownershipType: 'Company Owned',
    currentStatus: 'Operational (On Site)',
    currentProject: 'Eastern Expressway Bridge',
    assignedOperator: 'Akash Jadhav',
    operatorPhone: '+91 98220 54129',
    operatorLicence: 'DL-12-2020-HMV-TRANSIT',
    meterUnit: 'Kilometres',
    operatingHoursOrKm: 42150,
    serviceDueAtHoursOrKm: 45000,
    telematicsStatus: 'GPS Connected',
    telematicsImei: '869123849182390',
    lastKnownCoordinates: { lat: 19.0330, lng: 73.0297 },
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 300,
    averageConsumption: '2.8 KM / Litre',
    engineNumber: 'CUMMINS-ISBe-6.7-902',
    operatingCapacity: '16 m³ Rock Body / 28 Ton GVW',
    image: '/images/tipper_real.jpg',
    purchaseCost: 4620000,
    totalMaintenanceCost: 185000,
    totalFuelCost: 492000,
    documents: [
      {
        id: 'doc-21',
        name: 'RTO Registration Certificate',
        category: 'Registration Certificate (RC)',
        uploadedAt: '18 Jun 2022',
        status: 'Valid',
        url: '#'
      },
      {
        id: 'doc-22',
        name: 'National Commercial Goods Permit',
        category: 'Fitness Certificate',
        uploadedAt: '12 Jan 2026',
        expiryDate: '11 Jan 2027',
        status: 'Valid',
        url: '#'
      }
    ],
    maintenanceRecords: [
      {
        id: 'maint-21',
        type: 'Preventive Service',
        date: '28 Oct 2026',
        meterReadingHoursOrKm: 40000,
        description: 'Brake lining overhaul, bogie suspension greasing, tyre rotation.',
        sparePartsUsed: ['Brake Drum Linings Set', 'Heavy Grease Cartridges (4)'],
        vendorWorkshop: 'Tata Commercial Workshop Vashi',
        cost: 24000,
        status: 'Completed',
        technicianName: 'Sunil Rao'
      }
    ],
    inspections: [
      {
        id: 'insp-21',
        date: '17 Nov 2026',
        inspectorName: 'Er. Sunil Rao',
        inspectionType: 'Pre-Start Daily Checklist',
        hydraulicsOk: true,
        brakesOk: true,
        engineOilOk: true,
        tracksOrTyresOk: true,
        lightsAndHornOk: true,
        fireExtinguisherOk: true,
        status: 'Passed',
        remarks: 'Tipper hydraulic jack operating at optimal 180 bar pressure.'
      }
    ],
    assignmentHistory: [
      {
        id: 'asg-21',
        projectName: 'Eastern Expressway Bridge',
        siteLocation: 'Sector 12, Navi Mumbai',
        startDate: '15 Feb 2025',
        operatorName: 'Akash Jadhav',
        status: 'Current'
      }
    ],
    fuelLogs: [
      {
        id: 'fl-21',
        date: '15 Nov 2026',
        litres: 110,
        rate: 92.5,
        totalCost: 10175,
        meterReading: '42,100 km',
        pumpName: 'Bharat Petroleum Expressway Hub',
        receiptNumber: 'BPCL-INV-44019',
        supervisorName: 'Er. Sunil Rao'
      }
    ]
  },
  {
    id: '3',
    name: 'Sany Hydraulic Crawler Crane 75T',
    code: 'AST-CRN-03',
    registrationNumber: 'MH 12 EF 9081',
    serialNumber: 'SANY-SCC750A-77102',
    assetClass: 'Heavy Machinery',
    category: 'Hydraulic Crane',
    manufacturer: 'Sany Heavy Industry India',
    model: 'SCC750A Crawler Crane 75 Ton',
    manufacturingYear: 2021,
    ownershipType: 'Company Owned',
    currentStatus: 'Operational (On Site)',
    currentProject: 'Metro Line Piling',
    assignedOperator: 'Ganesh More',
    operatorPhone: '+91 94220 99887',
    operatorLicence: 'DL-04-2015-HEAVY-CRANE-PILOT',
    meterUnit: 'Hours',
    operatingHoursOrKm: 3120,
    serviceDueAtHoursOrKm: 3250,
    telematicsStatus: 'GPS Connected',
    telematicsImei: '861029384756192',
    lastKnownCoordinates: { lat: 18.4575, lng: 73.8677 },
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 400,
    averageConsumption: '12.5 Litres / Hour',
    engineNumber: 'WEICHAI-WP10G240E341',
    operatingCapacity: '75 Ton Max Lift / 58m Boom',
    image: '/images/crane_real.jpg',
    purchaseCost: 12500000,
    totalMaintenanceCost: 340000,
    totalFuelCost: 890000,
    documents: [
      {
        id: 'doc-31',
        name: 'Third-Party Crane Load Test & Rigging Certificate',
        category: 'Load Test Certificate',
        uploadedAt: '05 Dec 2025',
        expiryDate: '04 Dec 2026',
        status: 'Expiring Soon',
        url: '#'
      },
      {
        id: 'doc-32',
        name: 'Contractor All Risk (CAR) Machinery Insurance',
        category: 'Insurance Policy',
        uploadedAt: '01 Jan 2026',
        expiryDate: '31 Dec 2026',
        status: 'Valid',
        url: '#'
      }
    ],
    maintenanceRecords: [
      {
        id: 'maint-31',
        type: 'Preventive Service',
        date: '10 Nov 2026',
        meterReadingHoursOrKm: 3050,
        description: 'Full wire rope ultrasonic flaw detection, boom pin ultrasonic test, hydraulic oil replacement.',
        sparePartsUsed: ['Shell Tellus S2 V46 Hydraulic Oil (200L)', 'Slew Ring Grease EP2'],
        vendorWorkshop: 'Sany India On-Site Mobile Support',
        cost: 58000,
        status: 'Completed',
        technicianName: 'Sany Lead Eng. Nair'
      }
    ],
    inspections: [
      {
        id: 'insp-31',
        date: '17 Nov 2026',
        inspectorName: 'Er. Rajesh Kulkarni',
        inspectionType: 'Weekly EHS Safety Audit',
        hydraulicsOk: true,
        brakesOk: true,
        engineOilOk: true,
        tracksOrTyresOk: true,
        lightsAndHornOk: true,
        fireExtinguisherOk: true,
        status: 'Passed',
        remarks: 'Safe Load Indicator (SLI) calibrated. Anti-two-block limit switch functioning properly.'
      }
    ],
    assignmentHistory: [
      {
        id: 'asg-31',
        projectName: 'Metro Line Piling',
        siteLocation: 'Pier Section 14, Mumbai',
        startDate: '10 Oct 2024',
        operatorName: 'Ganesh More',
        status: 'Current'
      }
    ],
    fuelLogs: [
      {
        id: 'fl-31',
        date: '14 Nov 2026',
        litres: 180,
        rate: 92.5,
        totalCost: 16650,
        meterReading: '3,110 hrs',
        pumpName: 'Indian Oil Industrial Depot Chembur',
        receiptNumber: 'IOCL-DEP-99120',
        supervisorName: 'Er. Rajesh Kulkarni'
      }
    ]
  },
  {
    id: '4',
    name: 'Liebherr 85 EC-B 5b Tower Crane (Hired)',
    code: 'AST-TC-04',
    registrationNumber: 'RENT-TC-8812',
    serialNumber: 'LIEB-85ECB-55219',
    assetClass: 'Heavy Machinery',
    category: 'Tower Crane',
    manufacturer: 'Liebherr Werk Biberach GmbH',
    model: '85 EC-B 5b Flat-Top Crane',
    manufacturingYear: 2022,
    ownershipType: 'Rented / Hired',
    rentalVendor: 'Sanghvi Movers Infrastructure Equipment Ltd',
    rentalRatePerDay: 8500,
    rentalStartDate: '01 Jan 2026',
    rentalEndDate: '31 Dec 2026',
    currentStatus: 'Operational (On Site)',
    currentProject: 'Skyline Commercial Complex',
    assignedOperator: 'Dinesh Rathod (Certified Tower Pilot)',
    operatorPhone: '+91 97220 11442',
    operatorLicence: 'DL-01-2016-TOWER-CRANE',
    meterUnit: 'Hours',
    operatingHoursOrKm: 2180,
    serviceDueAtHoursOrKm: 2300,
    telematicsStatus: 'GPS Connected',
    telematicsImei: '861928475019283',
    lastKnownCoordinates: { lat: 18.55294, lng: 73.93481 },
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 250,
    averageConsumption: '8.2 Litres / Hour',
    engineNumber: 'ELECTRO-GENSET-DEUTZ-441',
    operatingCapacity: '5.0 Ton Max / 1.3 Ton at 50m Jib',
    image: '/images/crane_real.jpg',
    totalMaintenanceCost: 45000,
    totalFuelCost: 312000,
    documents: [
      {
        id: 'doc-41',
        name: 'Master Rental Agreement & Hire Contract',
        category: 'Rental Agreement',
        uploadedAt: '02 Jan 2026',
        expiryDate: '31 Dec 2026',
        status: 'Valid',
        url: '#'
      },
      {
        id: 'doc-42',
        name: 'Third-Party Annual Erection & Anchor Certificate',
        category: 'Load Test Certificate',
        uploadedAt: '10 Jan 2026',
        expiryDate: '09 Jan 2027',
        status: 'Valid',
        url: '#'
      }
    ],
    maintenanceRecords: [],
    inspections: [
      {
        id: 'insp-41',
        date: '17 Nov 2026',
        inspectorName: 'Er. Pravin Gaikwad',
        inspectionType: 'Pre-Start Daily Checklist',
        hydraulicsOk: true,
        brakesOk: true,
        engineOilOk: true,
        tracksOrTyresOk: true,
        lightsAndHornOk: true,
        fireExtinguisherOk: true,
        status: 'Passed',
        remarks: 'Aircraft warning light checked and functional. Wind anemometer reading within safe limits (14 km/h).'
      }
    ],
    assignmentHistory: [
      {
        id: 'asg-41',
        projectName: 'Skyline Commercial Complex',
        siteLocation: 'Kharadi IT Park, Pune',
        startDate: '01 Jan 2026',
        operatorName: 'Dinesh Rathod',
        status: 'Current'
      }
    ],
    fuelLogs: []
  },
  {
    id: '5',
    name: 'Ashok Leyland Captain 2518 Water Tanker 12,000L',
    code: 'AST-WT-05',
    registrationNumber: 'MH 12 JK 3341',
    serialNumber: 'AL-CAP-2518-99012',
    assetClass: 'Commercial Vehicle',
    category: 'Water Tanker',
    manufacturer: 'Ashok Leyland Ltd',
    model: 'Captain 2518 6x2 Multi-Axle',
    manufacturingYear: 2023,
    ownershipType: 'Company Owned',
    currentStatus: 'Operational (On Site)',
    currentProject: 'Industrial Logistics Park',
    assignedOperator: 'Vikram Salunke',
    operatorPhone: '+91 98223 99110',
    operatorLicence: 'DL-09-2019-HMV',
    meterUnit: 'Kilometres',
    operatingHoursOrKm: 28400,
    serviceDueAtHoursOrKm: 30000,
    telematicsStatus: 'GPS Connected',
    telematicsImei: '862910384729104',
    lastKnownCoordinates: { lat: 18.7510, lng: 73.8340 },
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 200,
    averageConsumption: '3.6 KM / Litre',
    engineNumber: 'H-SERIES-CRS-6CYL',
    operatingCapacity: '12,000 Litres Mild Steel Epoxy Coated',
    image: '/images/tipper_real.jpg',
    purchaseCost: 2950000,
    totalMaintenanceCost: 65000,
    totalFuelCost: 198000,
    documents: [
      {
        id: 'doc-51',
        name: 'RTO Commercial Registration Certificate',
        category: 'Registration Certificate (RC)',
        uploadedAt: '14 May 2023',
        status: 'Valid',
        url: '#'
      }
    ],
    maintenanceRecords: [],
    inspections: [],
    assignmentHistory: [
      {
        id: 'asg-51',
        projectName: 'Industrial Logistics Park',
        siteLocation: 'Chakan MIDC, Pune',
        startDate: '01 Nov 2025',
        operatorName: 'Vikram Salunke',
        status: 'Current'
      }
    ],
    fuelLogs: []
  },
  {
    id: '6',
    name: 'CAT 320D3 Hydraulic Excavator (Under Service)',
    code: 'AST-CAT-06',
    registrationNumber: 'MH 14 LM 1190',
    serialNumber: 'CAT-320D3-78401',
    assetClass: 'Heavy Machinery',
    category: 'Excavator / Backhoe',
    manufacturer: 'Caterpillar India',
    model: 'CAT 320D3 Crawler Track',
    manufacturingYear: 2022,
    ownershipType: 'Company Owned',
    currentStatus: 'Under Maintenance',
    currentProject: 'Eastern Expressway Bridge',
    assignedOperator: 'Mahesh Gaikwad',
    operatorPhone: '+91 94220 88291',
    operatorLicence: 'DL-11-2017-HEAVY',
    meterUnit: 'Hours',
    operatingHoursOrKm: 4950,
    serviceDueAtHoursOrKm: 5000,
    telematicsStatus: 'Device Offline',
    telematicsImei: '860192837465910',
    fuelType: 'Diesel (High Cetane)',
    fuelTankCapacityLitres: 410,
    averageConsumption: '14.0 Litres / Hour',
    engineNumber: 'CAT-C7.1-ACERT-889',
    operatingCapacity: '1.0 m³ Heavy Rock Bucket',
    image: '/images/jcb_real.jpg',
    purchaseCost: 6400000,
    totalMaintenanceCost: 260000,
    totalFuelCost: 620000,
    documents: [],
    maintenanceRecords: [
      {
        id: 'maint-61',
        type: 'Preventive Service',
        date: '16 Nov 2026',
        meterReadingHoursOrKm: 4950,
        description: 'Scheduled 5000-hr major overhaul: Track chain link replacement, hydraulic pump seal kit.',
        sparePartsUsed: ['Gland Packing Seal Kit', 'Hydraulic Filter Cartridges (3)'],
        vendorWorkshop: 'Gmmco Caterpillar Central Workshop',
        cost: 65000,
        status: 'In Progress',
        technicianName: 'Gmmco Specialist Pawar'
      }
    ],
    inspections: [],
    assignmentHistory: [],
    fuelLogs: []
  }
];

export function getStoredFleet(): EnterpriseAssetRecord[] {
  if (typeof window === 'undefined') return defaultEnterpriseFleet;
  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(defaultEnterpriseFleet));
      return defaultEnterpriseFleet;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEnterpriseFleet;
  } catch {
    return defaultEnterpriseFleet;
  }
}

export function saveFleet(fleet: EnterpriseAssetRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('fleetUpdated', { detail: fleet }));
  } catch (e) {
    console.error('Failed to save fleet to localStorage:', e);
  }
}

export function getAssetById(id: string): EnterpriseAssetRecord | undefined {
  const fleet = getStoredFleet();
  return fleet.find(a => a.id === id);
}

export function updateAsset(id: string, updates: Partial<EnterpriseAssetRecord>): EnterpriseAssetRecord[] {
  const fleet = getStoredFleet();
  const updated = fleet.map(a => {
    if (a.id === id) {
      return { ...a, ...updates };
    }
    return a;
  });
  saveFleet(updated);
  return updated;
}
