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
  category?: 'Commercial Building' | 'Highway Infrastructure' | 'Metro Rail transit' | 'Industrial Plant';
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
  // Deep detail relations scoped to this project
  gallery?: ProjectGalleryImage[];
  milestones?: ProjectMilestone[];
  documents?: ProjectDocument[];
  dailyReports?: ProjectDailyReport[];
}

export const defaultEnterpriseProjects: EnterpriseProjectRecord[] = [
  { 
    id: '1', 
    name: 'Skyline Commercial Complex', 
    code: 'PRJ-SKY-01', 
    client: 'K Raheja Corp', 
    location: 'Kharadi IT Park, Pune', 
    category: 'Commercial Building',
    budget: 42000000, 
    spent: 28500000, 
    status: 'Active', 
    progress: 68, 
    startDate: '01 Jan 2026', 
    expectedCompletion: '31 Dec 2026',
    image: '/images/commercial_tower.jpg',
    projectManager: 'Er. Rajesh Kulkarni',
    projectSupervisor: 'Er. Pravin Gaikwad',
    deployedMachinery: 6,
    description: 'Grade-A 18-storey IT tower with double basement parking, seismic design, and composite steel structure.',
    gallery: [
      { id: 'g1', url: '/images/commercial_tower.jpg', caption: 'Level 4 Slab Reinforcement & Column Concreting', sectionTag: 'Tower B Slab', uploadedAt: '17 Nov 2026', uploadedBy: 'Er. Pravin Gaikwad' },
      { id: 'g2', url: '/images/crane_real.jpg', caption: 'Tower Crane Material Hoisting to 5th Floor', sectionTag: 'Heavy Lift', uploadedAt: '16 Nov 2026', uploadedBy: 'Er. Pravin Gaikwad' },
      { id: 'g3', url: '/images/project2.jpg', caption: 'Basement 2 Retaining Wall Shotcreting & Anchoring', sectionTag: 'Basement Works', uploadedAt: '14 Nov 2026', uploadedBy: 'Er. Rajesh Kulkarni' },
      { id: 'g4', url: '/images/worker1.jpg', caption: 'Site Safety Induction & PPE Compliance Check', sectionTag: 'EHS Audit', uploadedAt: '12 Nov 2026', uploadedBy: 'Safety Officer Sawant' }
    ],
    milestones: [
      { id: 'm1', name: 'Substructure & Double Basement RCC', category: 'Civil Foundation', targetDate: '15 Apr 2026', status: 'Completed', completionPercent: 100 },
      { id: 'm2', name: 'Level 1 to 4 Superstructure Slabs', category: 'RCC Frame', targetDate: '20 Nov 2026', status: 'Completed', completionPercent: 100 },
      { id: 'm3', name: 'Level 5 to 10 Typical Floor Casting', category: 'RCC Frame', targetDate: '15 Feb 2027', status: 'In Progress', completionPercent: 45 },
      { id: 'm4', name: 'Facade Glazing & Curtain Wall Installation', category: 'External Finishes', targetDate: '30 Jun 2027', status: 'Pending', completionPercent: 0 },
      { id: 'm5', name: 'MEP Services & HVAC Chiller Testing', category: 'MEP Engineering', targetDate: '30 Oct 2027', status: 'Pending', completionPercent: 0 }
    ],
    documents: [
      { id: 'd1', name: 'Master EPC Construction Agreement.pdf', category: 'Contract', fileSize: '4.8 MB', uploadedAt: '05 Jan 2026', uploadedBy: 'Legal Dept (Pune)', downloadUrl: '#' },
      { id: 'd2', name: 'Structural G+18 GFC Drawings Rev-03.dwg', category: 'Drawing / Blueprint', fileSize: '18.4 MB', uploadedAt: '12 Feb 2026', uploadedBy: 'Chief Consultant', downloadUrl: '#' },
      { id: 'd3', name: 'PMC Environmental Clearances & Fire NOC.pdf', category: 'Statutory Approval', fileSize: '2.1 MB', uploadedAt: '20 Jan 2026', uploadedBy: 'Liaisoning Desk', downloadUrl: '#' }
    ],
    dailyReports: [
      { id: 'DPR-SKY-1711', reportDate: '17 Nov 2026', shift: 'Shift-1 (Day)', workExecuted: '145 m³ Concreting poured on Level 4 Slab, 12 column cages tied.', labourCount: 42, machineryCount: 4, dieselConsumedLitres: 60, submittedBy: 'Er. Pravin Gaikwad', approvalStatus: 'Approved' },
      { id: 'DPR-SKY-1611', reportDate: '16 Nov 2026', shift: 'Shift-1 (Day)', workExecuted: 'Shuttering staging alignment for beam span B1-B8 verified.', labourCount: 38, machineryCount: 3, dieselConsumedLitres: 45, submittedBy: 'Er. Pravin Gaikwad', approvalStatus: 'Approved' }
    ]
  },
  { 
    id: '2', 
    name: 'Eastern Expressway Bridge Sec-4', 
    code: 'PRJ-EXP-04', 
    client: 'NHAI (National Highway Authority)', 
    location: 'Thane - Bhiwandi Bypass, MH', 
    category: 'Highway Infrastructure',
    budget: 128000000, 
    spent: 107500000, 
    status: 'Active', 
    progress: 84, 
    startDate: '15 Mar 2025', 
    expectedCompletion: '30 Jun 2026',
    image: '/images/highway_bridge.jpg',
    projectManager: 'Er. Vikramaditya Deshmukh',
    projectSupervisor: 'Er. Sunil Rao',
    deployedMachinery: 12,
    description: 'Six-lane pre-stressed segmental elevated flyover with modern girder launching and pile foundation.',
    gallery: [
      { id: 'g21', url: '/images/highway_bridge.jpg', caption: 'Segmental Girder Span Launching over River Bed', sectionTag: 'Pier 4-5 Span', uploadedAt: '17 Nov 2026', uploadedBy: 'Er. Vikramaditya' },
      { id: 'g22', url: '/images/tipper_real.jpg', caption: 'Tata Prima Material Hauling at Pier 3 Abutment', sectionTag: 'Earthwork', uploadedAt: '15 Nov 2026', uploadedBy: 'Fleet Supervisor' },
      { id: 'g23', url: '/images/steel_wire.jpg', caption: 'High-Tensile Pre-Stressing Tendons Stressing Check', sectionTag: 'Cable Stressing', uploadedAt: '13 Nov 2026', uploadedBy: 'Quality In-charge' }
    ],
    milestones: [
      { id: 'm21', name: 'Open Well Caisson & Piling Foundation', category: 'Foundation', targetDate: '30 Aug 2025', status: 'Completed', completionPercent: 100 },
      { id: 'm22', name: 'Pier Shaft & Pier Cap Casting (24 Nos)', category: 'Substructure', targetDate: '15 Jan 2026', status: 'Completed', completionPercent: 100 },
      { id: 'm23', name: 'Segmental Box Girder Precast Launching', category: 'Superstructure', targetDate: '28 Feb 2026', status: 'In Progress', completionPercent: 88 },
      { id: 'm24', name: 'Mastic Asphalt Deck Wearing Coat', category: 'Pavement', targetDate: '30 Apr 2026', status: 'Pending', completionPercent: 0 }
    ],
    documents: [
      { id: 'd21', name: 'NHAI Concession Agreement & Package Specs.pdf', category: 'Contract', fileSize: '9.2 MB', uploadedAt: '10 Mar 2025', uploadedBy: 'NHAI Project Cell', downloadUrl: '#' },
      { id: 'd22', name: 'Bridge Pre-stressing Cable Profile Drawing.dwg', category: 'Drawing / Blueprint', fileSize: '14.5 MB', uploadedAt: '15 Apr 2025', uploadedBy: 'Design Bureau', downloadUrl: '#' }
    ],
    dailyReports: [
      { id: 'DPR-EXP-1711', reportDate: '17 Nov 2026', shift: 'Shift-1 (Day)', workExecuted: 'Pier-4 segmental cable stressing executed. 2 spans anchored at 1800 kN.', labourCount: 28, machineryCount: 8, dieselConsumedLitres: 110, submittedBy: 'Er. Sunil Rao', approvalStatus: 'Approved' }
    ]
  },
  { 
    id: '3', 
    name: 'Metro Line Corridor Piling & Station', 
    code: 'PRJ-MTR-09', 
    client: 'MMRDA Infrastructure', 
    location: 'Andheri East Line 7, Mumbai', 
    category: 'Metro Rail transit',
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
    description: 'High-precision hydraulic bored pile foundation with deep underground utility realignment.',
    gallery: [
      { id: 'g31', url: '/images/metro_piling.jpg', caption: 'Bored Cast-in-Situ Piling Rig Operation (1200mm Dia)', sectionTag: 'Station Pier P-102', uploadedAt: '17 Nov 2026', uploadedBy: 'Er. Santosh Jadhav' },
      { id: 'g32', url: '/images/hydraulic_part.jpg', caption: 'Hydraulic Kelly Bar Maintenance & Rig Assembly', sectionTag: 'Plant Maintenance', uploadedAt: '16 Nov 2026', uploadedBy: 'Mechanical Lead' }
    ],
    milestones: [
      { id: 'm31', name: 'Underground Gas & Water Utility Shifting', category: 'Enabling Works', targetDate: '30 Nov 2025', status: 'Completed', completionPercent: 100 },
      { id: 'm32', name: 'Station Column Piling (84 Piles)', category: 'Deep Foundations', targetDate: '28 Feb 2026', status: 'In Progress', completionPercent: 55 },
      { id: 'm33', name: 'Concourse Level Precast Pier Portal Assembly', category: 'Station Superstructure', targetDate: '31 Aug 2026', status: 'Pending', completionPercent: 0 }
    ],
    documents: [
      { id: 'd31', name: 'MMRDA Line 7 Corridor Alignment Sanction.pdf', category: 'Statutory Approval', fileSize: '6.4 MB', uploadedAt: '01 Aug 2025', uploadedBy: 'MMRDA Liaison', downloadUrl: '#' }
    ],
    dailyReports: [
      { id: 'DPR-MTR-1711', reportDate: '17 Nov 2026', shift: 'Shift-1 (Day)', workExecuted: 'Bored piling (1200mm dia) down to 24m bedrock. Bentonite flush completed.', labourCount: 35, machineryCount: 6, dieselConsumedLitres: 95, submittedBy: 'Er. Amit Shinde', approvalStatus: 'Under Review' }
    ]
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
  return all.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase()) || null;
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
