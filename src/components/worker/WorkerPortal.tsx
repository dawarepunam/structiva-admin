'use client';

import React, { useState, useEffect } from 'react';
import styles from './WorkerPortal.module.css';
import { WorkerProfile, WorkerTaskRecord, WorkerAttendanceRecord } from './data/workerTypes';
import WorkerHeader from './components/WorkerHeader';
import WorkerSidebar from './components/WorkerSidebar';
import WorkerBottomNavigation from './components/WorkerBottomNavigation';
import WorkerDashboard from './components/WorkerDashboard';
import WorkerProfileView from './components/WorkerProfile';
import WorkerProjectsView from './components/WorkerProjects';
import WorkerAttendanceView from './components/WorkerAttendance';
import WorkerTasksView from './components/WorkerTasks';
import WorkerLeaveView from './components/WorkerLeave';
import WorkerSalaryView from './components/WorkerSalary';
import WorkerAdvanceView from './components/WorkerAdvance';
import WorkerNotificationsView from './components/WorkerNotifications';
import WorkerSafetyView from './components/WorkerSafety';
import WorkerDocumentsView from './components/WorkerDocuments';
import WorkerSupportView from './components/WorkerSupport';
import WorkerSettingsView from './components/WorkerSettings';
import { fetchStrapiCollection } from '@/services/strapiClient';
import { getStoredEnterpriseTasks } from '@/services/taskStorage';
import { getStoredWorkers, getWorkerById } from '@/services/workerStorage';
import { useRouter } from 'next/navigation';

export default function WorkerPortalCoordinator() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Read tab from URL hash on initial load so page refresh stays on current tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['dashboard', 'profile', 'projects', 'attendance', 'tasks', 'leave', 'salary', 'advance', 'notifications', 'safety', 'documents', 'support', 'settings'];
      if (hash && validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    }
  }, []);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  // Default initial worker profile (Ramesh Patil - WRK-MUM-104)
  const [worker, setWorker] = useState<WorkerProfile>({
    id: 1,
    workerId: '1',
    code: 'WRK-MUM-104',
    name: 'Ramesh Patil',
    phone: '+91 98220 12345',
    email: 'ramesh.patil@structiva.internal',
    category: 'Skilled',
    skill: 'Master Bar Bender & Structural Mason',
    dailyWage: 950,
    overtimeHourlyRate: 140,
    status: 'Active',
    assignedProject: 'Skyline Commercial Complex (Tower A)',
    supervisorName: 'Er. Pravin Gaikwad',
    presentDaysThisMonth: 19,
    overtimeHoursThisMonth: 14,
    advanceTakenThisMonth: 3000,
    totalDaysWorked: 185
  });

  const [tasks, setTasks] = useState<WorkerTaskRecord[]>([]);
  const [attendance, setAttendance] = useState<WorkerAttendanceRecord[]>([]);

  // Load real Strapi records
  const loadData = async () => {
    try {
      setLoading(true);

      // Load session worker if logged in
      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem('structiva_active_worker_session');
        if (sessionStr) {
          try {
            const parsedSession = JSON.parse(sessionStr);
            const freshWorker = getWorkerById(parsedSession.id?.toString() || parsedSession.workerId?.toString());
            if (freshWorker) {
              setWorker({
                id: freshWorker.id,
                workerId: freshWorker.id,
                code: freshWorker.code,
                name: freshWorker.name,
                phone: freshWorker.phone,
                email: `${freshWorker.name.toLowerCase().replace(/\s+/g, '.')}@structiva.internal`,
                category: freshWorker.category,
                skill: freshWorker.skill,
                dailyWage: freshWorker.dailyWage,
                overtimeHourlyRate: freshWorker.overtimeHourlyRate,
                status: freshWorker.status,
                assignedProject: freshWorker.assignedProject,
                supervisorName: freshWorker.supervisorName,
                presentDaysThisMonth: freshWorker.presentDaysThisMonth || 19,
                overtimeHoursThisMonth: freshWorker.overtimeHoursThisMonth || 14,
                advanceTakenThisMonth: freshWorker.advanceTakenThisMonth || 0,
                totalDaysWorked: freshWorker.totalDaysWorked || 185
              });
            } else {
              setWorker(parsedSession);
            }
          } catch (e) {
            console.error('Session worker parse error:', e);
          }
        }
      }

      const [workersRes, reqsRes, attRes] = await Promise.all([
        fetchStrapiCollection<any>('workers', []),
        fetchStrapiCollection<any>('supervisor-requests', []),
        fetchStrapiCollection<any>('attendances', [])
      ]);

      const defaultTasks: WorkerTaskRecord[] = [
        {
          id: 1,
          title: 'M-35 Ready-Mix Concrete Pouring (Level 14 Slab)',
          project: 'Skyline Commercial Complex (Tower A)',
          site: 'Tower A (Core & Podium)',
          category: 'Civil & Concreting',
          priority: 'Critical',
          status: 'In Progress',
          details: 'Guide concrete pump boom operator, ensure mechanical needle vibrator coverage across edge beams, and prevent air voids.',
          assignedSupervisor: 'Er. Pravin Gaikwad',
          assignedWorkerId: 1,
          assignedWorkerName: 'Ramesh Patil',
          exactLocation: 'Level 14 East Face Grid C-4'
        },
        {
          id: 2,
          title: 'Fe 550D TMT Reinforcement Tie-Up (Beam B-14)',
          project: 'Skyline Commercial Complex (Tower A)',
          site: 'Tower A (Core & Podium)',
          category: 'Bar Bending',
          priority: 'High',
          status: 'In Progress',
          details: 'Double binding wire ties on top reinforcement mesh before scheduled evening slump testing.',
          assignedSupervisor: 'Er. Pravin Gaikwad',
          assignedWorkerId: 1,
          assignedWorkerName: 'Ramesh Patil',
          exactLocation: 'Level 14 North Core'
        }
      ];

      // Read from resilient local task storage as well
      const localTasks = getStoredEnterpriseTasks();
      const localWorkerTasks: WorkerTaskRecord[] = localTasks.map(t => {
        const details = t.details || {};
        return {
          id: t.id,
          documentId: t.documentId,
          title: t.title,
          project: t.project,
          site: t.site,
          category: t.category,
          priority: t.priority as any,
          status: t.status as any,
          details: details.workInProgress || t.remarks || 'Active site work assignment.',
          remarks: t.remarks,
          adminRemarks: t.adminRemarks,
          submittedBy: t.submittedBy,
          submittedDate: t.submittedDate,
          assignedSupervisor: t.assignedSupervisor || 'Er. Pravin Gaikwad',
          assignedWorkerId: t.assignedWorkerId || 1,
          assignedWorkerName: t.assignedWorkerName || 'Ramesh Patil',
          exactLocation: t.exactLocation || t.site
        };
      });

      if (reqsRes && reqsRes.length > 0) {
        const taskItems: WorkerTaskRecord[] = reqsRes
          .filter((r: any) => r.request_type === 'Task' || r.requestType === 'Task')
          .map((r: any) => ({
            id: r.id,
            documentId: r.documentId || r.document_id,
            title: r.title,
            project: r.project || 'Skyline Commercial Complex (Tower A)',
            site: r.site || 'Tower A (Core & Podium)',
            category: r.category || 'Structural',
            priority: r.priority || 'Standard',
            status: r.status || 'In Progress',
            details: typeof r.details === 'string' ? r.details : r.details?.workInProgress || r.remarks || 'Active site work assignment.',
            remarks: r.remarks,
            adminRemarks: r.adminRemarks || r.admin_remarks,
            submittedBy: r.submittedBy || r.submitted_by,
            submittedDate: r.submittedDate || r.submitted_date,
            assignedSupervisor: r.assigned_supervisor || 'Er. Pravin Gaikwad',
            assignedWorkerId: r.assigned_worker_id || 1,
            assignedWorkerName: r.assigned_worker_name || 'Ramesh Patil',
            workerRemarks: r.worker_remarks,
            exactLocation: r.exact_location || 'Level 14 Core Zone'
          }));

        // Merge strapi and local tasks
        const combined = [...localWorkerTasks];
        taskItems.forEach(item => {
          if (!combined.some(c => String(c.id) === String(item.id) || (c.documentId && c.documentId === item.documentId))) {
            combined.push(item);
          }
        });

        setTasks(combined.length > 0 ? combined : defaultTasks);
      } else {
        setTasks(localWorkerTasks.length > 0 ? localWorkerTasks : defaultTasks);
      }

      if (attRes && attRes.length > 0) {
        setAttendance(attRes);
      }
    } catch (err) {
      console.error('Error loading worker portal Strapi data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of STRUCTIVA Worker Portal?')) {
      router.push('/worker/login');
    }
  };

  const getModuleTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Worker Shift Dashboard';
      case 'profile': return 'My Worker Profile';
      case 'projects': return 'My Projects & Sites';
      case 'attendance': return 'Muster Roll & Attendance';
      case 'tasks': return 'My Assigned Work Orders';
      case 'leave': return 'Leave Management';
      case 'salary': return 'Wages & Payslips';
      case 'advance': return 'Salary Advances';
      case 'notifications': return 'Site Notifications';
      case 'safety': return 'Safety Center';
      case 'documents': return 'My Documents';
      case 'support': return 'Help & Support Desk';
      case 'settings': return 'Account Settings';
      default: return 'Worker Portal';
    }
  };

  return (
    <div className={styles.portalContainer}>
      {/* Desktop & Mobile Responsive Drawer Sidebar */}
      <WorkerSidebar
        worker={worker}
        currentTab={currentTab}
        isOpen={sidebarOpen}
        onSelectTab={handleSelectTab}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <WorkerHeader
          worker={worker}
          activeModuleTitle={getModuleTitle()}
          onNotificationsClick={() => handleSelectTab('notifications')}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className={styles.pageBody}>
          {currentTab === 'dashboard' && (
            <WorkerDashboard
              worker={worker}
              tasks={tasks}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'profile' && (
            <WorkerProfileView worker={worker} />
          )}

          {currentTab === 'projects' && (
            <WorkerProjectsView worker={worker} />
          )}

          {currentTab === 'attendance' && (
            <WorkerAttendanceView worker={worker} attendanceRecords={attendance} />
          )}

          {currentTab === 'tasks' && (
            <WorkerTasksView tasks={tasks} onTaskUpdated={loadData} />
          )}

          {currentTab === 'leave' && (
            <WorkerLeaveView worker={worker} />
          )}

          {currentTab === 'salary' && (
            <WorkerSalaryView worker={worker} />
          )}

          {currentTab === 'advance' && (
            <WorkerAdvanceView worker={worker} />
          )}

          {currentTab === 'notifications' && (
            <WorkerNotificationsView />
          )}

          {currentTab === 'safety' && (
            <WorkerSafetyView worker={worker} />
          )}

          {currentTab === 'documents' && (
            <WorkerDocumentsView worker={worker} />
          )}

          {currentTab === 'support' && (
            <WorkerSupportView worker={worker} />
          )}

          {currentTab === 'settings' && (
            <WorkerSettingsView worker={worker} />
          )}

          {/* Unified Responsive Worker Portal Footer */}
          <footer style={{
            marginTop: '2.5rem',
            padding: '1.5rem 1rem',
            borderTop: '1px solid #E5E7EB',
            background: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, color: '#172B32', fontSize: '0.9rem', letterSpacing: '0.5px' }}>STRUCTIVA INFRASTRUCTURE CORP.</span>
              <span style={{ color: '#B58B59', fontWeight: 600, fontSize: '0.85rem' }}>• Worker Field Operations</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', maxWidth: '600px', lineHeight: '1.5' }}>
              Enterprise Labour Welfare, Real-Time Geo-Muster, Biometric Compliance & Safe Site Engineering Protocol.
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              © {new Date().getFullYear()} Structiva Corp. All Rights Reserved. Powered by Strapi v5 & Next.js Engine.
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <WorkerBottomNavigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onMoreClick={() => setSidebarOpen(true)}
      />
    </div>
  );
}
