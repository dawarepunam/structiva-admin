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
import { useRouter } from 'next/navigation';

export default function WorkerPortalCoordinator() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const [workersRes, reqsRes, attRes] = await Promise.all([
        fetchStrapiCollection<any>('workers', []),
        fetchStrapiCollection<any>('supervisor-requests', []),
        fetchStrapiCollection<any>('attendances', [])
      ]);

      if (workersRes && workersRes.length > 0) {
        const found = workersRes.find((w: any) => w.id === 1 || w.code === 'WRK-MUM-104') || workersRes[0];
        setWorker({
          id: found.id,
          documentId: found.documentId,
          workerId: String(found.workerId || found.id),
          code: found.code || 'WRK-MUM-104',
          name: found.name || 'Ramesh Patil',
          phone: found.phone || '+91 98220 12345',
          email: found.email || 'ramesh.patil@structiva.internal',
          category: found.category || 'Skilled',
          skill: found.skill || 'Master Bar Bender & Structural Mason',
          dailyWage: found.dailyWage || 950,
          overtimeHourlyRate: found.overtimeHourlyRate || 140,
          status: found.status || 'Active',
          assignedProject: found.assignedProject || 'Skyline Commercial Complex (Tower A)',
          supervisorName: found.supervisorName || 'Er. Pravin Gaikwad',
          presentDaysThisMonth: found.presentDaysThisMonth || 19,
          overtimeHoursThisMonth: found.overtimeHoursThisMonth || 14,
          advanceTakenThisMonth: found.advanceTakenThisMonth || 3000,
          totalDaysWorked: found.totalDaysWorked || 185,
          dob: found.dob,
          gender: found.gender,
          address: found.address,
          hometown: found.hometown,
          aadhaarNumber: found.aadhaarNumber,
          bankName: found.bankName,
          accountNumberMasked: found.accountNumberMasked,
          ifscCode: found.ifscCode
        });
      }

      if (reqsRes && reqsRes.length > 0) {
        const taskItems: WorkerTaskRecord[] = reqsRes
          .filter((r: any) => r.request_type === 'Task' || r.requestType === 'Task')
          .map((r: any) => ({
            id: r.id,
            documentId: r.documentId || r.document_id,
            title: r.title,
            project: r.project,
            site: r.site,
            category: r.category || 'Structural',
            priority: r.priority || 'Standard',
            status: r.status || 'In Progress',
            details: typeof r.details === 'string' ? r.details : r.details?.workInProgress || r.remarks,
            remarks: r.remarks,
            adminRemarks: r.adminRemarks || r.admin_remarks,
            submittedBy: r.submittedBy || r.submitted_by,
            submittedDate: r.submittedDate || r.submitted_date,
            assignedSupervisor: r.assigned_supervisor || 'Er. Pravin Gaikwad',
            assignedWorkerId: r.assigned_worker_id || 1,
            assignedWorkerName: r.assigned_worker_name || 'Ramesh Patil',
            workerRemarks: r.worker_remarks,
            exactLocation: r.exact_location
          }));

        setTasks(taskItems);
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
        onSelectTab={setCurrentTab}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <WorkerHeader
          worker={worker}
          activeModuleTitle={getModuleTitle()}
          onNotificationsClick={() => setCurrentTab('notifications')}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className={styles.pageBody}>
          {currentTab === 'dashboard' && (
            <WorkerDashboard
              worker={worker}
              tasks={tasks}
              onNavigateTab={setCurrentTab}
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
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <WorkerBottomNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onMoreClick={() => setSidebarOpen(true)}
      />
    </div>
  );
}
