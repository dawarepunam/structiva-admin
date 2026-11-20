import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity, deleteStrapiEntity } from './strapiClient';

export const PROJECTS_STORAGE_KEY = 'structiva_enterprise_projects_v2';

export interface ProjectMilestone {
  id: string;
  name: string;
  category: string;
  targetDate: string;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Pending';
  completionPercent: number;
}

export interface ProjectGalleryImage {
  id: string;
  url: string;
  caption: string;
  sectionTag: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  category: 'Contract' | 'Drawing / Blueprint' | 'Statutory Approval' | 'Work Order' | 'Technical Spec';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl: string;
}

export interface ProjectDailyReport {
  id: string;
  reportDate: string;
  shift: 'Shift-1 (Day)' | 'Shift-2 (Night)';
  workExecuted: string;
  labourCount: number;
  machineryCount: number;
  dieselConsumedLitres: number;
  submittedBy: string;
  approvalStatus: 'Approved' | 'Under Review' | 'Draft';
}

export interface EnterpriseProjectRecord {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  category?: 'Water Pipeline Infrastructure' | 'Solar Infrastructure' | 'Water Storage Tanks' | 'Heavy Fabrication' | 'Commercial Building' | 'Highway Infrastructure' | 'Metro Rail Transit';
  budget: number;
  spent: number;
  status: 'Active' | 'Under Review' | 'Completed';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  image: string;
  projectManager: string;
  projectSupervisor?: string;
  deployedMachinery: number;
  description: string;
  slug?: string;
  isProtected?: boolean;
  // Deep detail relations scoped to this project
  gallery?: ProjectGalleryImage[];
  milestones?: ProjectMilestone[];
  documents?: ProjectDocument[];
  dailyReports?: ProjectDailyReport[];
}

export const defaultEnterpriseProjects: EnterpriseProjectRecord[] = [
  { 
    id: '1', 
    name: 'Skyline Commercial Complex (Tower A)', 
    code: 'PRJ-SKY-01', 
    client: 'Prestige Global Infrastructures Ltd', 
    location: 'Kalyani Nagar, Pune', 
    category: 'Commercial Building',
    budget: 142000000, 
    spent: 102240000, 
    status: 'Active', 
    progress: 72, 
    startDate: '01 Jan 2026', 
    expectedCompletion: '15 Dec 2026',
    image: '/images/commercial_tower.jpg',
    projectManager: 'Er. Rajesh Kulkarni',
    projectSupervisor: 'Er. Pravin Gaikwad',
    deployedMachinery: 14,
    description: 'Twin commercial high-rise tower development with multi-level automated basement car park and composite steel frames.',
    slug: 'skyline-commercial-complex',
    isProtected: true
  },
  { 
    id: '2', 
    name: 'Eastern Expressway Link Highway', 
    code: 'PRJ-EXP-04', 
    client: 'NHAI Maharashtra Div', 
    location: 'Chakan-Talegaon Corridor, Pune', 
    category: 'Highway Infrastructure',
    budget: 85000000, 
    spent: 35700000, 
    status: 'Active', 
    progress: 42, 
    startDate: '15 Mar 2025', 
    expectedCompletion: '30 Nov 2026',
    image: '/images/highway_bridge.jpg',
    projectManager: 'Er. Vikramaditya Deshmukh',
    projectSupervisor: 'Er. Sunil Rao',
    deployedMachinery: 8,
    description: 'Four-lane expressway bypass link corridor with modern pre-cast concrete box drainage culverts and road widening.',
    slug: 'eastern-expressway-link-highway',
    isProtected: true
  },
  { 
    id: '3', 
    name: 'Pune Metro Water Storage & GLS Reservoir System', 
    code: 'PRJ-WST-03', 
    client: 'Pune Municipal Corporation (PMC)', 
    location: 'Wagholi & Hadapsar Hubs, Pune', 
    category: 'Water Storage Tanks',
    budget: 45000000, 
    spent: 39600000, 
    status: 'Active', 
    progress: 88, 
    startDate: '10 Aug 2025', 
    expectedCompletion: '28 Feb 2026',
    image: '/images/water_tank_real.jpg',
    projectManager: 'Er. Santosh Jadhav',
    projectSupervisor: 'Er. Amit Shinde',
    deployedMachinery: 10,
    description: 'Construction of 35 Lakh Litres capacity Glass-Fused-to-Steel (GFS) and RCC Elevated Storage Reservoir with automatic SCADA chlorination pumps.',
    slug: 'pune-metro-water-storage-reservoir',
    isProtected: true
  },
  { 
    id: '4', 
    name: 'Chakan Industrial MS Water Transmission Pipeline (65 Km)', 
    code: 'PRJ-WTR-01', 
    client: 'MIDC Water Works Division', 
    location: 'Chakan Industrial Corridor, Pune', 
    category: 'Water Pipeline Infrastructure',
    budget: 125000000, 
    spent: 92500000, 
    status: 'Active', 
    progress: 74, 
    startDate: '15 Jan 2025', 
    expectedCompletion: '15 Mar 2026',
    image: '/images/pipeline_trench.jpg',
    projectManager: 'Er. Rajesh Kulkarni',
    projectSupervisor: 'Er. Pravin Gaikwad',
    deployedMachinery: 16,
    description: 'Laying and commissioning of 1400mm Mild Steel welded pipeline with epoxy internal lining, micro-tunneling under NH-60, and cathodic protection.',
    slug: 'chakan-industrial-water-pipeline',
    isProtected: true
  },
  { 
    id: '5', 
    name: 'Solapur 250 MWp Utility Solar Balance of Plant (BOP)', 
    code: 'PRJ-SOL-02', 
    client: 'Tata Power Renewable Energy', 
    location: 'Solapur Solar Park, Maharashtra', 
    category: 'Solar Infrastructure',
    budget: 180000000, 
    spent: 147600000, 
    status: 'Active', 
    progress: 82, 
    startDate: '01 Nov 2024', 
    expectedCompletion: '30 Jan 2026',
    image: '/images/solar_park_real.jpg',
    projectManager: 'Er. Santosh Jadhav',
    projectSupervisor: 'Er. Sunil Rao',
    deployedMachinery: 22,
    description: 'Turnkey civil balance of plant including 120,000 driven MMS pile posts, inverter sub-stations, and 33kV internal underground collector power network.',
    slug: 'solapur-utility-solar-farm',
    isProtected: true
  },
  { 
    id: '6', 
    name: 'Bhusawal Heavy Steel Railway Overbridge (ROB) Girders', 
    code: 'PRJ-ROB-05', 
    client: 'Central Railway Engineering Div', 
    location: 'Bhusawal Junction, Maharashtra', 
    category: 'Heavy Fabrication',
    budget: 78000000, 
    spent: 70980000, 
    status: 'Active', 
    progress: 91, 
    startDate: '01 Aug 2024', 
    expectedCompletion: '10 Jan 2026',
    image: '/images/steel_fabrication_real.jpg',
    projectManager: 'Er. Vikramaditya Deshmukh',
    projectSupervisor: 'Er. Amit Shinde',
    deployedMachinery: 12,
    description: 'Fabrication and launch of 72m clear span composite structural steel plate girders with ultrasonic weld verification and polyurethane anti-corrosion coating.',
    slug: 'bhusawal-railway-overbridge-fabrication',
    isProtected: true
  },
  { 
    id: '7', 
    name: 'Metro Line Corridor Piling & Elevated Viaduct', 
    code: 'PRJ-MTR-09', 
    client: 'MMRDA Infrastructure', 
    location: 'Andheri East Line 7, Mumbai', 
    category: 'Metro Rail Transit',
    budget: 85000000, 
    spent: 35700000, 
    status: 'Active', 
    progress: 42, 
    startDate: '10 Aug 2025', 
    expectedCompletion: '15 Mar 2027',
    image: '/images/metro_piling.jpg',
    projectManager: 'Er. Santosh Jadhav',
    projectSupervisor: 'Er. Amit Shinde',
    deployedMachinery: 8,
    description: 'High-precision hydraulic bored pile foundation with deep underground utility realignment and segmental viaduct piers.',
    slug: 'metro-line-corridor-piling',
    isProtected: true
  }
];

export function getStoredProjects(): EnterpriseProjectRecord[] {
  if (typeof window === 'undefined') return defaultEnterpriseProjects;
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(defaultEnterpriseProjects));
      return defaultEnterpriseProjects;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEnterpriseProjects;
  } catch {
    return defaultEnterpriseProjects;
  }
}

export function getProjectById(id: string): EnterpriseProjectRecord | null {
  const all = getStoredProjects();
  return all.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase() || p.slug === id) || null;
}

export function saveProjects(projects: EnterpriseProjectRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: projects }));

    // Non-blocking background sync with Strapi backend
    projects.forEach(p => {
      createStrapiEntity('projects', p).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

export async function fetchProjectsFromBackend(): Promise<EnterpriseProjectRecord[]> {
  try {
    const list = await fetchStrapiCollection<EnterpriseProjectRecord>('projects', getStoredProjects());
    if (list && list.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
      }
      return list;
    }
  } catch {}
  return getStoredProjects();
}

export function updateProject(id: string, updates: Partial<EnterpriseProjectRecord>): boolean {
  const all = getStoredProjects();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...updates };
  saveProjects(all);
  return true;
}
