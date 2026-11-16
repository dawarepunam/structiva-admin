export const PROJECTS_STORAGE_KEY = 'structiva_enterprise_projects_v2';

export interface EnterpriseProjectRecord {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  budget: number;
  spent: number;
  status: 'Active' | 'Under Review' | 'Completed';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  image: string;
  projectManager: string;
  deployedMachinery: number;
  description: string;
}

export const defaultEnterpriseProjects: EnterpriseProjectRecord[] = [
  { 
    id: '1', 
    name: 'Skyline Commercial Complex', 
    code: 'PRJ-SKY-01', 
    client: 'K Raheja Corp', 
    location: 'Kharadi IT Park, Pune', 
    budget: 42000000, 
    spent: 28500000, 
    status: 'Active', 
    progress: 68, 
    startDate: '01 Jan 2026', 
    expectedCompletion: '31 Dec 2026',
    image: '/images/commercial_tower.jpg',
    projectManager: 'Er. Rajesh Kulkarni',
    deployedMachinery: 6,
    description: 'Grade-A 18-storey IT tower with double basement parking, seismic design, and composite steel structure.'
  },
  { 
    id: '2', 
    name: 'Eastern Expressway Bridge Sec-4', 
    code: 'PRJ-EXP-04', 
    client: 'NHAI (National Highway Authority)', 
    location: 'Thane - Bhiwandi Bypass, MH', 
    budget: 128000000, 
    spent: 107500000, 
    status: 'Active', 
    progress: 84, 
    startDate: '15 Mar 2025', 
    expectedCompletion: '30 Jun 2026',
    image: '/images/highway_bridge.jpg',
    projectManager: 'Er. Vikramaditya Deshmukh',
    deployedMachinery: 12,
    description: 'Six-lane pre-stressed segmental elevated flyover with modern girder launching and pile foundation.'
  },
  { 
    id: '3', 
    name: 'Metro Line Corridor Piling & Station', 
    code: 'PRJ-MTR-09', 
    client: 'MMRDA Infrastructure', 
    location: 'Andheri East Line 7, Mumbai', 
    budget: 85000000, 
    spent: 35700000, 
    status: 'Active', 
    progress: 42, 
    startDate: '10 Aug 2025', 
    expectedCompletion: '15 Mar 2027',
    image: '/images/metro_piling.jpg',
    projectManager: 'Er. Santosh Jadhav',
    deployedMachinery: 8,
    description: 'High-precision hydraulic bored pile foundation with deep underground utility realignment.'
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

export function saveProjects(projects: EnterpriseProjectRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: projects }));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}
