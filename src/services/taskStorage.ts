import { fetchStrapiCollection, createStrapiEntity, updateStrapiEntity } from './strapiClient';

export const SUPERVISOR_TASKS_STORAGE_KEY = 'structiva_enterprise_supervisor_tasks_v1';

export interface EnterpriseTaskRecord {
  id: string | number;
  documentId?: string;
  requestType: 'Task';
  title: string;
  project: string;
  site: string;
  category: string;
  priority: 'Critical' | 'High' | 'Standard';
  status: 'In Progress' | 'Completed' | 'Not Started' | 'Delayed';
  submittedBy: string;
  submittedDate: string;
  assignedSupervisor?: string;
  assignedWorkerId?: string | number;
  assignedWorkerName?: string;
  exactLocation?: string;
  remarks?: string;
  adminRemarks?: string;
  details: {
    taskId: string;
    plannedQty: number;
    completedQty: number;
    unit: string;
    progressPercent: number;
    startDate: string;
    dueDate: string;
    assignedTeam: string;
    workCompletedToday?: string;
    workInProgress?: string;
    blockers?: string;
  };
}

export const DEFAULT_ENTERPRISE_TASKS: EnterpriseTaskRecord[] = [
  {
    id: 'tsk-001',
    requestType: 'Task',
    title: 'M-35 Ready-Mix Concrete Pouring (Level 14 Slab)',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A Core & Podium',
    category: 'Civil & Concreting',
    priority: 'Critical',
    status: 'In Progress',
    submittedBy: 'Er. Pravin Gaikwad',
    submittedDate: '18 Nov 2026',
    assignedSupervisor: 'Er. Pravin Gaikwad',
    assignedWorkerId: '1',
    assignedWorkerName: 'Ramesh Patil',
    exactLocation: 'Level 14 East Face Grid C-4',
    remarks: 'Guide concrete pump boom operator, ensure mechanical needle vibrator coverage across edge beams.',
    adminRemarks: 'Structural audit cleared. Ensure 28-day cube strength samples are cast.',
    details: {
      taskId: 'TSK-SKY-101',
      plannedQty: 180,
      completedQty: 130,
      unit: 'm³',
      progressPercent: 72,
      startDate: '16 Nov 2026',
      dueDate: '21 Nov 2026',
      assignedTeam: 'Ramesh Patil (Master Bar Bender) & 14 Labours',
      workCompletedToday: '130 m³ verified by supervisor.',
      workInProgress: 'Pumping remaining 50 m³ onto north edge beams.',
      blockers: 'None'
    }
  },
  {
    id: 'tsk-002',
    requestType: 'Task',
    title: 'Fe 550D TMT Reinforcement Tie-Up (Beam B-14)',
    project: 'Skyline Commercial Complex (Tower A)',
    site: 'Tower A Core & Podium',
    category: 'Bar Bending',
    priority: 'High',
    status: 'In Progress',
    submittedBy: 'Er. Pravin Gaikwad',
    submittedDate: '17 Nov 2026',
    assignedSupervisor: 'Er. Pravin Gaikwad',
    assignedWorkerId: '1',
    assignedWorkerName: 'Ramesh Patil',
    exactLocation: 'Level 14 North Core',
    remarks: 'Double binding wire ties on top reinforcement mesh before scheduled evening slump testing.',
    adminRemarks: 'Verify lap length per IS 456 specification.',
    details: {
      taskId: 'TSK-SKY-102',
      plannedQty: 12,
      completedQty: 8,
      unit: 'MT',
      progressPercent: 67,
      startDate: '15 Nov 2026',
      dueDate: '20 Nov 2026',
      assignedTeam: 'Ramesh Patil & Rebar Crew',
      workCompletedToday: '8 MT steel bound and tied.',
      workInProgress: 'Tying stirrups on B-14 beam.',
      blockers: 'None'
    }
  },
  {
    id: 'tsk-003',
    requestType: 'Task',
    title: 'Subgrade Compaction & MS Pipe Trench Excavation',
    project: 'Chakan Industrial MS Water Transmission Pipeline (65 Km)',
    site: 'Zone 2 Chakan Corridor',
    category: 'Water Pipeline',
    priority: 'High',
    status: 'In Progress',
    submittedBy: 'Er. Pravin Gaikwad',
    submittedDate: '19 Nov 2026',
    assignedSupervisor: 'Er. Pravin Gaikwad',
    assignedWorkerId: '2',
    assignedWorkerName: 'Suresh Shinde',
    exactLocation: 'Chainage 14+200 to 15+800',
    remarks: 'Trench depth 2.4m bedding with sand cushioning.',
    adminRemarks: 'Maintain safety shoring near culvert crossing.',
    details: {
      taskId: 'TSK-WTR-201',
      plannedQty: 1600,
      completedQty: 1180,
      unit: 'R.Mtr',
      progressPercent: 74,
      startDate: '12 Nov 2026',
      dueDate: '24 Nov 2026',
      assignedTeam: 'Suresh Shinde (Excavator Lead) & Trench Team',
      workCompletedToday: '1180 R.Mtr excavated and graded.',
      workInProgress: 'Laying 1200mm dia MS pipe spools.',
      blockers: 'None'
    }
  }
];

export function getStoredEnterpriseTasks(): EnterpriseTaskRecord[] {
  if (typeof window === 'undefined') return DEFAULT_ENTERPRISE_TASKS;
  try {
    const raw = localStorage.getItem(SUPERVISOR_TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUPERVISOR_TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_ENTERPRISE_TASKS));
      return DEFAULT_ENTERPRISE_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ENTERPRISE_TASKS;
  } catch {
    return DEFAULT_ENTERPRISE_TASKS;
  }
}

export function saveStoredEnterpriseTasks(tasks: EnterpriseTaskRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPERVISOR_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: tasks }));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

export async function fetchEnterpriseTasksFromBackend(): Promise<EnterpriseTaskRecord[]> {
  try {
    const strapiData = await fetchStrapiCollection<any>('supervisor-requests', []);
    const localTasks = getStoredEnterpriseTasks();

    if (strapiData && strapiData.length > 0) {
      const strapiTasks: EnterpriseTaskRecord[] = strapiData
        .filter((r: any) => r.requestType === 'Task' || r.request_type === 'Task')
        .map((r: any) => {
          let parsedDetails: any = {};
          try {
            parsedDetails = typeof r.details === 'string' ? JSON.parse(r.details) : (r.details || {});
          } catch {
            parsedDetails = {};
          }

          return {
            id: r.id || r.documentId,
            documentId: r.documentId,
            requestType: 'Task',
            title: r.title,
            project: r.project,
            site: r.site,
            category: r.category || 'General Civil',
            priority: r.priority || 'Standard',
            status: r.status || 'In Progress',
            submittedBy: r.submittedBy || r.submitted_by,
            submittedDate: r.submittedDate || r.submitted_date || 'Today',
            assignedSupervisor: r.assigned_supervisor || r.submittedBy,
            assignedWorkerId: r.assigned_worker_id,
            assignedWorkerName: r.assigned_worker_name,
            exactLocation: r.exact_location || r.site,
            remarks: r.remarks,
            adminRemarks: r.adminRemarks || r.admin_remarks,
            details: {
              taskId: parsedDetails.taskId || `TSK-${r.id || '100'}`,
              plannedQty: parsedDetails.plannedQty || 100,
              completedQty: parsedDetails.completedQty || 0,
              unit: parsedDetails.unit || 'Units',
              progressPercent: parsedDetails.progressPercent !== undefined ? parsedDetails.progressPercent : (r.status === 'Completed' ? 100 : 50),
              startDate: parsedDetails.startDate || '16 Nov 2026',
              dueDate: parsedDetails.dueDate || '25 Nov 2026',
              assignedTeam: parsedDetails.assignedTeam || 'Site Crew',
              workCompletedToday: parsedDetails.workCompletedToday || '',
              workInProgress: parsedDetails.workInProgress || '',
              blockers: parsedDetails.blockers || 'None'
            }
          };
        });

      // Merge unique tasks: local tasks + strapi tasks
      const combined = [...localTasks];
      strapiTasks.forEach(st => {
        const idx = combined.findIndex(c => String(c.id) === String(st.id) || (c.documentId && c.documentId === st.documentId) || c.title === st.title);
        if (idx >= 0) {
          combined[idx] = st;
        } else {
          combined.unshift(st);
        }
      });

      saveStoredEnterpriseTasks(combined);
      return combined;
    }
    return localTasks;
  } catch {
    return getStoredEnterpriseTasks();
  }
}
