'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './WorkerProfile.module.css';
import {
  getWorkerById, EnterpriseWorkerRecord, updateWorker, WorkerLeaveRecord, WorkerDocument
} from '@/services/workerStorage';
import SafeImage from '@/components/admin/ui/SafeImage';
import {
  ArrowLeft, Phone, MapPin, ShieldCheck, Calendar, Clock, DollarSign, Award,
  FileText, Briefcase, CheckCircle2, AlertTriangle, AlertCircle, User, Activity,
  ExternalLink, Download, Plus, ChevronRight, Edit3, HeartPulse, CreditCard,
  Building, UserCheck, Check, X
} from 'lucide-react';
import Link from 'next/link';

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.id as string;

  const [worker, setWorker] = useState<EnterpriseWorkerRecord | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'personal' | 'skills' | 'projects' | 'attendance' | 'salary' | 'documents' | 'leaves' | 'activity'
  >('overview');

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Paid Leave' as 'Paid Leave' | 'Sick Leave' | 'Emergency / Casual',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    days: 3,
    reason: ''
  });

  // Load worker data
  useEffect(() => {
    if (workerId) {
      const data = getWorkerById(workerId);
      if (data) {
        setWorker(data);
      }
    }
  }, [workerId]);

  if (!worker) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h3>Retrieving Worker Profile...</h3>
          <p>Connecting to Structiva Enterprise central registry</p>
          <Link href="/admin/workforce" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Workforce Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle Apply Leave
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) return;

    const newLeave: WorkerLeaveRecord = {
      id: `lv-${Date.now()}`,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: Number(leaveForm.days) || 1,
      reason: leaveForm.reason,
      status: 'Approved',
      approvedBy: 'Er. Rajesh Kulkarni (Auto-Approved)'
    };

    const updatedLeaves = [newLeave, ...(worker.leaves || [])];
    const updated = updateWorker(worker.id, {
      leaves: updatedLeaves
    });
    setWorker(updated.find(w => w.id === worker.id) || null);
    setShowLeaveModal(false);
    setLeaveForm({
      type: 'Paid Leave',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      days: 3,
      reason: ''
    });
  };

  const currentStatus = worker.status || 'Active';

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb & Navigation */}
      <div className={styles.topNav}>
        <button onClick={() => router.push('/admin/workforce')} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Workforce Directory</span>
        </button>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{worker.name} ({worker.code})</span>
      </div>

      {/* Hero Header Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.avatarWrapper}>
            <SafeImage
              src={worker.avatar}
              alt={worker.name}
              fallbackType="worker"
              className={styles.avatarImg}
            />
            <span className={`${styles.statusDot} ${styles[currentStatus.toLowerCase()]}`} />
          </div>

          <div className={styles.heroDetails}>
            <div className={styles.heroTitleRow}>
              <h1 className={styles.workerTitle}>{worker.name}</h1>
              <span className={styles.workerCodeBadge}>{worker.code}</span>
              <span className={`${styles.categoryBadge} ${styles[(worker.category || 'Skilled').toLowerCase().replace('-', '')]}`}>
                {worker.category || 'Skilled'}
              </span>
              <span className={`${styles.musterBadge} ${styles[currentStatus.toLowerCase()]}`}>
                ● {currentStatus}
              </span>
            </div>

            <p className={styles.heroTradeSkill}>{worker.skill}</p>

            <div className={styles.heroMetaList}>
              <div className={styles.metaPill}>
                <Building size={13} className={styles.metaIcon} />
                <span>Site: <strong>{worker.assignedProject || 'Unassigned'}</strong></span>
              </div>
              <div className={styles.metaPill}>
                <Phone size={13} className={styles.metaIcon} />
                <span>{worker.phone}</span>
              </div>
              <div className={styles.metaPill}>
                <UserCheck size={13} className={styles.metaIcon} />
                <span>Supervisor: <strong>{worker.supervisorName || 'Er. Rajesh Kulkarni'}</strong></span>
              </div>
              {worker.safetyCertified && (
                <div className={styles.metaPillSafe}>
                  <ShieldCheck size={13} />
                  <span>EHS Certified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.wageHighlightCard}>
            <span className={styles.wageLabel}>Standard Daily Wage</span>
            <div className={styles.wageValueRow}>
              <span className={styles.currencySymbol}>₹</span>
              <span className={styles.wageAmount}>{worker.dailyWage}</span>
              <span className={styles.wageUnit}>/ Day</span>
            </div>
            <div className={styles.overtimeSub}>
              <span>OT Rate: ₹{worker.overtimeHourlyRate || 140}/hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9 Profile Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsScroller}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={15} />
            <span>1. Overview</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'personal' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <HeartPulse size={15} />
            <span>2. Personal Details</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Award size={15} />
            <span>3. Work & Skills</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Briefcase size={15} />
            <span>4. Project History</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'attendance' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Calendar size={15} />
            <span>5. Attendance</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'salary' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            <CreditCard size={15} />
            <span>6. Salary & Payments</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={15} />
            <span>7. Documents ({worker.documents?.length || 0})</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'leaves' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Clock size={15} />
            <span>8. Leave Mgmt ({worker.leaves?.length || 0})</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === 'activity' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={15} />
            <span>9. Activity History</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className={styles.tabContentArea}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Quick KPI Stat Cards */}
            <div className={styles.overviewStatsRow}>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Total Site Days Worked</span>
                <strong className={styles.statBoxVal}>{worker.totalDaysWorked} Days</strong>
                <span className={styles.statBoxSub}>Lifetime logged shifts</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Present This Month</span>
                <strong className={styles.statBoxVal}>{worker.presentDaysThisMonth || 22} Days</strong>
                <span className={styles.statBoxSub}>92% Attendance rate</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Overtime This Month</span>
                <strong className={styles.statBoxVal}>{worker.overtimeHoursThisMonth || 16} Hours</strong>
                <span className={styles.statBoxSub}>₹ {(worker.overtimeHoursThisMonth || 16) * (worker.overtimeHourlyRate || 140)} earned</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statBoxLabel}>Advance Taken</span>
                <strong className={styles.statBoxVal}>₹ {worker.advanceTakenThisMonth || 0}</strong>
                <span className={styles.statBoxSub}>Adjustable in monthly cycle</span>
              </div>
            </div>

            {/* Current Site Assignment Card */}
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <Building size={18} className={styles.headerIcon} />
                  <h3>Active Project Site Deployment</h3>
                </div>
                <span className={styles.badgeActive}>Active Deployment</span>
              </div>

              <div className={styles.assignmentDetails}>
                <div className={styles.assignRow}>
                  <div>
                    <span className={styles.labelMuted}>Project Name</span>
                    <h4 className={styles.valEmphasized}>{worker.assignedProject || 'Unassigned'}</h4>
                  </div>
                  <div>
                    <span className={styles.labelMuted}>Role & Trade Assigned</span>
                    <strong className={styles.valNormal}>{worker.skill}</strong>
                  </div>
                  <div>
                    <span className={styles.labelMuted}>Site Engineer / Lead</span>
                    <strong className={styles.valNormal}>{worker.supervisorName || 'Er. Rajesh Kulkarni'}</strong>
                  </div>
                  <div>
                    <span className={styles.labelMuted}>Deployment Mode</span>
                    <span className={styles.pillMuted}>{worker.employmentType || 'Direct Payroll'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities Feed */}
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <Activity size={18} className={styles.headerIcon} />
                  <h3>Recent Site Activities & Logs</h3>
                </div>
                <button onClick={() => setActiveTab('activity')} className={styles.viewAllBtn}>
                  View All History
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.activityList}>
                {(worker.recentActivities || []).slice(0, 3).map((act, idx) => (
                  <div key={idx} className={styles.activityItem}>
                    <div className={styles.activityTimeCol}>
                      <strong>{act.date}</strong>
                      <span>{act.time}</span>
                    </div>
                    <div className={styles.activityDotCol}>
                      <span className={styles.timelineDot} />
                    </div>
                    <div className={styles.activityBody}>
                      <div className={styles.activityTypeRow}>
                        <span className={styles.activityType}>{act.type}</span>
                        <span className={styles.activitySite}>{act.site}</span>
                      </div>
                      <p className={styles.activityDesc}>{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Details */}
        {activeTab === 'personal' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <User size={18} className={styles.headerIcon} />
                <h3>Personal Identity & Statutory Records</h3>
              </div>
              <span className={styles.badgeVerified}>
                <CheckCircle2 size={13} />
                Verified Profile
              </span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Full Legal Name</span>
                <span className={styles.detailVal}>{worker.name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date of Birth</span>
                <span className={styles.detailVal}>{worker.dob || '15 June 1988'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Gender</span>
                <span className={styles.detailVal}>{worker.gender || 'Male'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Blood Group</span>
                <span className={styles.detailVal}>{worker.bloodGroup || 'B+'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Aadhaar Number</span>
                <span className={styles.detailValMonospace}>{worker.aadhaarNumber || 'XXXX-XXXX-8921'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Permanent Account Number (PAN)</span>
                <span className={styles.detailValMonospace}>{worker.panNumber || 'ABCDE1234F'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Mobile Phone</span>
                <span className={styles.detailVal}>{worker.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Native Hometown</span>
                <span className={styles.detailVal}>{worker.hometown || 'Satara, Maharashtra'}</span>
              </div>
            </div>

            <div className={styles.separator} />

            <h4 className={styles.subSectionHeading}>Residential Address & Emergency Contact</h4>
            <div className={styles.detailsGrid2}>
              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Current Residential Address / Labour Camp</span>
                <span className={styles.detailVal}>{worker.address || 'Room 14, Chawl No. 4, Kharadi Gaon, Pune, Maharashtra 411014'}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Emergency Contact Number</span>
                <span className={styles.detailValEmphasized}>{worker.emergencyContact}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Relationship</span>
                <span className={styles.detailVal}>{worker.emergencyRelation || 'Spouse'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Work & Skills */}
        {activeTab === 'skills' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Award size={18} className={styles.headerIcon} />
                <h3>Trade Skills, Experience & Compliance</h3>
              </div>
            </div>

            <div className={styles.skillsSection}>
              <div className={styles.skillRow}>
                <span className={styles.detailLabel}>Primary Trade Specialization</span>
                <h4 className={styles.primaryTrade}>{worker.skill}</h4>
              </div>

              <div className={styles.skillRow}>
                <span className={styles.detailLabel}>Verified Competency Badges</span>
                <div className={styles.tagWrap}>
                  {(worker.additionalSkills || ['Structural Bar Bending', 'Rebar Tying', 'Post-Tensioning', 'Scaffolding Safety']).map((tag, i) => (
                    <span key={i} className={styles.skillTag}>
                      <Check size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.separator} />

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Experience</span>
                  <span className={styles.detailVal}>{worker.experienceYears || 10} Years on Major Sites</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Employment Classification</span>
                  <span className={styles.detailVal}>{worker.employmentType || 'Direct Payroll'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date of Joining</span>
                  <span className={styles.detailVal}>{worker.joiningDate || '10 April 2023'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>EHS Safety Induction</span>
                  <span className={styles.detailValSafe}>
                    <ShieldCheck size={14} />
                    Certified ({worker.inductionDate || '12 Apr 2023'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Project History */}
        {activeTab === 'projects' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Briefcase size={18} className={styles.headerIcon} />
                <h3>Site Assignments & Deployment History</h3>
              </div>
            </div>

            <div className={styles.projectHistoryTimeline}>
              {(worker.projectHistory || [
                {
                  projectId: '1',
                  projectName: worker.assignedProject || 'Skyline Commercial Complex',
                  role: worker.skill,
                  startDate: '01 Nov 2025',
                  status: 'Current',
                  performanceRating: 5.0
                }
              ]).map((ph, idx) => (
                <div key={idx} className={styles.historyCard}>
                  <div className={styles.historyTop}>
                    <div>
                      <h4 className={styles.histProjName}>{ph.projectName}</h4>
                      <span className={styles.histRole}>{ph.role}</span>
                    </div>
                    <span className={ph.status === 'Current' ? styles.badgeCurrent : styles.badgeDone}>
                      {ph.status}
                    </span>
                  </div>

                  <div className={styles.historyMetaRow}>
                    <div className={styles.histPeriod}>
                      <Calendar size={13} />
                      <span>{ph.startDate} {ph.endDate ? `to ${ph.endDate}` : '– Present'}</span>
                    </div>
                    <div className={styles.histRating}>
                      <span>Rating: <strong>★ {ph.performanceRating.toFixed(1)} / 5.0</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Attendance */}
        {activeTab === 'attendance' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Calendar size={18} className={styles.headerIcon} />
                <h3>Biometric & RFID Attendance Record (November 2026)</h3>
              </div>
              <span className={styles.badgeEmerald}>
                {worker.presentDaysThisMonth || 22} Days Present
              </span>
            </div>

            <div className={styles.attendanceCalendarBox}>
              <div className={styles.calendarHeaderRow}>
                <span>Daily Muster Calendar: 1 Nov 2026 – Today</span>
                <div className={styles.calLegend}>
                  <span className={styles.legendPresent}>● Present</span>
                  <span className={styles.legendAbsent}>● Absent</span>
                  <span className={styles.legendLeave}>● Leave</span>
                </div>
              </div>

              {/* Day Grid 1..30 */}
              <div className={styles.dayGrid}>
                {Array.from({ length: 17 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === 17;
                  let dayStatus = 'present';
                  if (dayNum === 8 || dayNum === 15) dayStatus = 'holiday'; // Sundays
                  else if (dayNum === 5) dayStatus = 'leave';
                  else if (dayNum === 12) dayStatus = 'absent';
                  if (isToday) {
                    dayStatus = currentStatus === 'Inactive' ? 'absent' : 'present';
                  }

                  return (
                    <div key={dayNum} className={`${styles.dayCell} ${styles[dayStatus]}`}>
                      <span className={styles.dayNum}>{dayNum}</span>
                      <span className={styles.dayStatusText}>
                        {dayStatus === 'holiday' ? 'OFF' : dayStatus === 'present' ? 'P' : dayStatus === 'absent' ? 'A' : 'L'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.attendanceStatsFooter}>
                <div className={styles.attStatItem}>
                  <span>Total Working Days</span>
                  <strong>17 Days</strong>
                </div>
                <div className={styles.attStatItem}>
                  <span>Present</span>
                  <strong className={styles.textEmerald}>14 Days</strong>
                </div>
                <div className={styles.attStatItem}>
                  <span>Overtime Logged</span>
                  <strong>{worker.overtimeHoursThisMonth || 16} Hours</strong>
                </div>
                <div className={styles.attStatItem}>
                  <span>Late Arrivals</span>
                  <strong>0</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Salary & Payments */}
        {activeTab === 'salary' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <DollarSign size={18} className={styles.headerIcon} />
                <h3>Compensation, Overtime & Payout Ledger</h3>
              </div>
            </div>

            <div className={styles.salaryOverviewGrid}>
              <div className={styles.salaryCard}>
                <span className={styles.salLabel}>Standard Daily Wage</span>
                <strong className={styles.salAmount}>₹ {worker.dailyWage}</strong>
                <span className={styles.salSub}>Fixed 8-hour shift rate</span>
              </div>
              <div className={styles.salaryCard}>
                <span className={styles.salLabel}>Calculated Gross This Month</span>
                <strong className={styles.salAmount}>
                  ₹ {((worker.presentDaysThisMonth || 22) * worker.dailyWage) + ((worker.overtimeHoursThisMonth || 16) * (worker.overtimeHourlyRate || 140))}
                </strong>
                <span className={styles.salSub}>{worker.presentDaysThisMonth || 22} days + {worker.overtimeHoursThisMonth || 16}h OT</span>
              </div>
              <div className={styles.salaryCard}>
                <span className={styles.salLabel}>Advance Taken</span>
                <strong className={styles.salAmount}>₹ {worker.advanceTakenThisMonth || 0}</strong>
                <span className={styles.salSub}>To be deducted at month end</span>
              </div>
              <div className={styles.salaryCard}>
                <span className={styles.salLabel}>Net Estimated Payout</span>
                <strong className={styles.salAmountEmerald}>
                  ₹ {(((worker.presentDaysThisMonth || 22) * worker.dailyWage) + ((worker.overtimeHoursThisMonth || 16) * (worker.overtimeHourlyRate || 140))) - (worker.advanceTakenThisMonth || 0)}
                </strong>
                <span className={styles.salSub}>Disbursement scheduled on 1st Dec</span>
              </div>
            </div>

            <div className={styles.separator} />

            <h4 className={styles.subSectionHeading}>Bank Account & Disbursement Mode</h4>
            <div className={styles.bankInfoBox}>
              <div className={styles.bankRow}>
                <div>
                  <span className={styles.detailLabel}>Disbursement Mode</span>
                  <span className={styles.pillMuted}>{worker.paymentMode || 'Bank Transfer'}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Bank Name</span>
                  <strong className={styles.detailVal}>{worker.bankName || 'State Bank of India'}</strong>
                </div>
                <div>
                  <span className={styles.detailLabel}>Account Number</span>
                  <span className={styles.detailValMonospace}>{worker.accountNumberMasked || '•••• •••• 4519'}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>IFSC Code</span>
                  <span className={styles.detailValMonospace}>{worker.ifscCode || 'SBIN0004521'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Documents */}
        {activeTab === 'documents' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <FileText size={18} className={styles.headerIcon} />
                <h3>Compliance Documents & Identity Proofs</h3>
              </div>
            </div>

            <div className={styles.documentsList}>
              {(worker.documents || []).length === 0 ? (
                <div className={styles.emptyDocState}>
                  <FileText size={32} className={styles.emptyIcon} />
                  <p>No documents uploaded yet for this worker.</p>
                </div>
              ) : (
                worker.documents.map(doc => (
                  <div key={doc.id} className={styles.docRow}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconBox}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className={styles.docName}>{doc.name}</h4>
                        <div className={styles.docMeta}>
                          <span>Category: <strong>{doc.category}</strong></span>
                          <span>•</span>
                          <span>Uploaded: {doc.uploadedAt}</span>
                          {doc.expiryDate && (
                            <>
                              <span>•</span>
                              <span>Expires: {doc.expiryDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.docRight}>
                      <span className={`${styles.docStatusBadge} ${styles[doc.status.toLowerCase().replace(' ', '')]}`}>
                        {doc.status}
                      </span>
                      <button className={styles.docActionBtn} title="View Document">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Leave Management */}
        {activeTab === 'leaves' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Clock size={18} className={styles.headerIcon} />
                <h3>Leave Applications & Sanctions</h3>
              </div>
              <button onClick={() => setShowLeaveModal(true)} className={styles.btnApplyLeave}>
                <Plus size={14} />
                <span>Apply / Sanction Leave</span>
              </button>
            </div>

            <div className={styles.leavesList}>
              {(worker.leaves || []).length === 0 ? (
                <div className={styles.emptyDocState}>
                  <Clock size={32} className={styles.emptyIcon} />
                  <p>No leave records found for this worker.</p>
                </div>
              ) : (
                worker.leaves.map(lv => (
                  <div key={lv.id} className={styles.leaveCard}>
                    <div className={styles.leaveTopRow}>
                      <div>
                        <span className={styles.leaveType}>{lv.type}</span>
                        <h4 className={styles.leaveReason}>{lv.reason}</h4>
                      </div>
                      <span className={styles.badgeApproved}>
                        <CheckCircle2 size={13} />
                        {lv.status}
                      </span>
                    </div>

                    <div className={styles.leaveMeta}>
                      <div className={styles.leavePeriod}>
                        <Calendar size={13} />
                        <span>{lv.startDate} to {lv.endDate} ({lv.days} Days)</span>
                      </div>
                      {lv.approvedBy && (
                        <div className={styles.leaveApprover}>
                          <span>Approved by: <strong>{lv.approvedBy}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 9: Activity History */}
        {activeTab === 'activity' && (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderTitle}>
                <Activity size={18} className={styles.headerIcon} />
                <h3>Comprehensive Audit & Activity Trail</h3>
              </div>
            </div>

            <div className={styles.activityTimelineFull}>
              {(worker.recentActivities || []).map((act, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.tlTime}>
                    <strong>{act.date}</strong>
                    <span>{act.time}</span>
                  </div>
                  <div className={styles.tlDivider}>
                    <span className={styles.tlDot} />
                    {idx < (worker.recentActivities?.length || 0) - 1 && <span className={styles.tlLine} />}
                  </div>
                  <div className={styles.tlContent}>
                    <div className={styles.tlBadgeRow}>
                      <span className={styles.tlTypeBadge}>{act.type}</span>
                      <span className={styles.tlSiteBadge}>{act.site}</span>
                    </div>
                    <p className={styles.tlText}>{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowLeaveModal(false)}>
          <div className={styles.leaveModalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Apply / Sanction Site Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className={styles.leaveForm}>
              <div className={styles.formGroup}>
                <label>Leave Category</label>
                <select
                  value={leaveForm.type}
                  onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                >
                  <option value="Paid Leave">Paid Annual / Festival Leave</option>
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Emergency / Casual">Emergency / Casual Leave</option>
                </select>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Number of Days</label>
                <input
                  type="number"
                  min="1"
                  value={leaveForm.days}
                  onChange={e => setLeaveForm({ ...leaveForm, days: Number(e.target.value) })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Detail reason for absence, travel to hometown, or medical advice..."
                />
              </div>

              <div className={styles.modalFooterActions}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Sanction & Approve Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
