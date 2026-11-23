'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ProjectDetails.module.css';
import SafeImage from '@/components/admin/ui/SafeImage';
import { 
  getProjectById, 
  EnterpriseProjectRecord, 
  updateProject,
  ProjectGalleryImage,
  ProjectMilestone,
  ProjectDocument,
  ProjectDailyReport
} from '@/services/projectStorage';
import { getStoredWorkers, EnterpriseWorkerRecord, saveWorkers } from '@/services/workerStorage';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  HardHat, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  DollarSign, 
  Layers, 
  Image as ImageIcon, 
  FileText, 
  Users, 
  Briefcase, 
  Plus, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  TrendingUp,
  AlertTriangle,
  Upload,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<EnterpriseProjectRecord | null>(null);
  const [projectWorkers, setProjectWorkers] = useState<EnterpriseWorkerRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'progress' | 'timeline' | 'budget' | 'team' | 'machinery' | 'documents' | 'reports'>('overview');

  // Load project workers
  const loadWorkers = (projectName?: string) => {
    const all = getStoredWorkers();
    if (projectName) {
      const filtered = all.filter(w => {
        const p = (w.assignedProject || '').toLowerCase();
        const target = projectName.toLowerCase();
        return p === target || p.includes(target) || target.includes(p);
      });
      setProjectWorkers(filtered);
    } else {
      setProjectWorkers([]);
    }
  };

  useEffect(() => {
    if (projectId) {
      const p = getProjectById(projectId);
      setProject(p);
      if (p) loadWorkers(p.name);
    }

    const handleStorageUpdate = () => {
      if (projectId) {
        const p = getProjectById(projectId);
        setProject(p);
        if (p) loadWorkers(p.name);
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('workersUpdated', handleStorageUpdate);
    window.addEventListener('projectsUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('workersUpdated', handleStorageUpdate);
      window.removeEventListener('projectsUpdated', handleStorageUpdate);
    };
  }, [projectId]);

  if (!project) {
    return (
      <div className={styles.emptyContainer}>
        <Building2 size={40} className={styles.emptyIcon} />
        <h2>Project Not Found</h2>
        <p>The requested project ID does not exist or has been archived.</p>
        <Link href="/admin/projects" className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Return to Projects Listing</span>
        </Link>
      </div>
    );
  }

  // Calculate Remaining Days
  const calculateDaysRemaining = () => {
    try {
      const target = new Date(project.expectedCompletion);
      const now = new Date();
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 145;
    }
  };

  const remainingDays = calculateDaysRemaining();
  const remainingBudget = project.budget - project.spent;
  const budgetUtilization = Math.round((project.spent / project.budget) * 100);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.caption) return;
    const newImg: ProjectGalleryImage = {
      id: `g-${Date.now()}`,
      url: '/images/commercial_tower.jpg',
      caption: photoForm.caption,
      sectionTag: photoForm.sectionTag,
      uploadedAt: 'Just now',
      uploadedBy: project.projectSupervisor || 'Er. Pravin Gaikwad'
    };
    const updatedGallery = [newImg, ...(project.gallery || [])];
    updateProject(project.id, { gallery: updatedGallery });
    setProject({ ...project, gallery: updatedGallery });
    setShowPhotoModal(false);
    setPhotoForm({ caption: '', sectionTag: 'Site Inspection' });
  };

  // Progress Update Handler
  const handleProgressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(progressForm.newProgress);
    updateProject(project.id, { progress: val });
    setProject({ ...project, progress: val });
    setShowProgressModal(false);
  };

  // Daily Report Handler
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: ProjectDailyReport = {
      id: `DPR-${Date.now().toString().slice(-4)}`,
      reportDate: '17 Nov 2026',
      shift: reportForm.shift as any,
      workExecuted: reportForm.workExecuted,
      labourCount: Number(reportForm.labourCount),
      machineryCount: Number(reportForm.machineryCount),
      dieselConsumedLitres: Number(reportForm.fuelLitres),
      submittedBy: project.projectSupervisor || 'Site Engineer',
      approvalStatus: 'Approved'
    };
    const updated = [newRep, ...(project.dailyReports || [])];
    updateProject(project.id, { dailyReports: updated });
    setProject({ ...project, dailyReports: updated });
    setShowReportModal(false);
    setReportForm({ shift: 'Shift-1 (Day)', workExecuted: '', labourCount: 30, machineryCount: 4, fuelLitres: 50 });
  };

  return (
    <div className={styles.detailsWrapper}>
      {/* Back Navigation Bar */}
      <div className={styles.topNavBack}>
        <Link href="/admin/projects" className={styles.backLink}>
          <ArrowLeft size={15} />
          <span>Back to Projects Portfolio</span>
        </Link>
        <span className={styles.breadcrumbDivider}>/</span>
        <span className={styles.breadcrumbCurrent}>{project.name}</span>
      </div>

      {/* ========================================================
          PROJECT HERO SECTION (MATCHES MNC SPECIFICATION)
          ======================================================== */}
      <div className={styles.projectHero}>
        <div className={styles.heroBackground}>
          <SafeImage 
            src={project.image} 
            alt={project.name} 
            fallbackType="project"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTopBadges}>
            <span className={styles.projectCodeBadge}>{project.code}</span>
            <span className={styles.statusBadgeActive}>● {project.status}</span>
            <span className={styles.categoryBadge}>{project.category || 'Commercial Infrastructure'}</span>
          </div>

          <h1 className={styles.projectTitle}>{project.name}</h1>

          <div className={styles.heroMetaRow}>
            <div className={styles.metaItem}>
              <MapPin size={14} className={styles.metaIcon} />
              <span>{project.location}</span>
            </div>
            <div className={styles.metaItem}>
              <Briefcase size={14} className={styles.metaIcon} />
              <span>Client: <strong>{project.client}</strong></span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={14} className={styles.metaIcon} />
              <span>{project.startDate} — {project.expectedCompletion}</span>
            </div>
          </div>

          {/* Manager & Supervisor Badges */}
          <div className={styles.heroLeadershipRow}>
            <div className={styles.leadAvatarGroup}>
              <div className={styles.leadAvatar}>RK</div>
              <div>
                <span className={styles.leadRole}>Project Manager</span>
                <strong className={styles.leadName}>{project.projectManager}</strong>
              </div>
            </div>

            <div className={styles.leadAvatarGroup}>
              <div className={styles.leadAvatar}>PG</div>
              <div>
                <span className={styles.leadRole}>Site Supervisor</span>
                <strong className={styles.leadName}>{project.projectSupervisor || 'Er. Pravin Gaikwad'}</strong>
              </div>
            </div>

            <div className={styles.heroProgressPill}>
              <span>Overall Progress:</span>
              <strong className={styles.progressPercentText}>{project.progress}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          9 HORIZONTAL NAVIGATION TABS
          ======================================================== */}
      <div className={styles.tabsBar}>
        {[
          { key: 'overview', label: '1. Overview', icon: Layers },
          { key: 'gallery', label: '2. Gallery', icon: ImageIcon },
          { key: 'progress', label: '3. Progress', icon: TrendingUp },
          { key: 'timeline', label: '4. Timeline', icon: Calendar },
          { key: 'budget', label: '5. Budget', icon: DollarSign },
          { key: 'team', label: '6. Team', icon: Users },
          { key: 'machinery', label: '7. Machinery', icon: Truck },
          { key: 'documents', label: '8. Documents', icon: FileText },
          { key: 'reports', label: '9. Daily Reports', icon: HardHat },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`${styles.tabBtn} ${isActive ? styles.activeTabBtn : ''}`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW (SMART PROJECT SUMMARY)
          ======================================================== */}
      {activeTab === 'overview' && (
        <div className={styles.tabContentArea}>
          {/* Section 2: 4 Actionable KPI Cards */}
          <div className={styles.overviewKpiGrid}>
            <div className={styles.kpiCard} onClick={() => setActiveTab('progress')}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Overall Progress</span>
                <TrendingUp size={16} className={styles.kpiIconEmerald} />
              </div>
              <div className={styles.kpiValue}>{project.progress}%</div>
              <span className={styles.kpiSubtext}>Click to manage milestones →</span>
            </div>

            <div className={styles.kpiCard} onClick={() => setActiveTab('budget')}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total Approved Budget</span>
                <DollarSign size={16} className={styles.kpiIconBronze} />
              </div>
              <div className={styles.kpiValue}>₹ {(project.budget / 10000000).toFixed(2)} Cr</div>
              <span className={styles.kpiSubtext}>Sanctioned Contract Value</span>
            </div>

            <div className={styles.kpiCard} onClick={() => setActiveTab('budget')}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total Spent to Date</span>
                <CheckCircle2 size={16} className={styles.kpiIconSuccess} />
              </div>
              <div className={styles.kpiValue}>₹ {(project.spent / 10000000).toFixed(2)} Cr</div>
              <span className={styles.kpiSubtext}>{budgetUtilization}% utilized of approved budget</span>
            </div>

            <div className={styles.kpiCard} onClick={() => setActiveTab('timeline')}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Remaining Days</span>
                <Clock size={16} className={styles.kpiIconInfo} />
              </div>
              <div className={styles.kpiValue}>{remainingDays} Days</div>
              <span className={styles.kpiSubtext}>Target: {project.expectedCompletion}</span>
            </div>
          </div>

          {/* Section 3 & 4: Progress + Budget Breakdown Grid */}
          <div className={styles.twoColumnGrid}>
            {/* Work Progress Summary */}
            <div className={styles.cardPanel}>
              <h3 className={styles.panelTitle}>Work Progress Summary</h3>
              <p className={styles.panelDesc}>Detailed structural execution milestones status.</p>

              <div className={styles.milestonesListMini}>
                {(project.milestones || []).map(m => (
                  <div key={m.id} className={styles.milestoneRow}>
                    <div className={styles.milestoneInfo}>
                      <span className={styles.milestoneName}>{m.name}</span>
                      <span className={styles.milestoneCat}>{m.category} • Target: {m.targetDate}</span>
                    </div>
                    <span className={`${styles.milestoneBadge} ${styles[m.status.toLowerCase().replace(' ', '')]}`}>
                      {m.status} ({m.completionPercent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget & Expenditure Summary */}
            <div className={styles.cardPanel}>
              <h3 className={styles.panelTitle}>Budget Summary</h3>
              <p className={styles.panelDesc}>Financial utilization and balance tracking.</p>

              <div className={styles.budgetGaugeBlock}>
                <div className={styles.budgetBarTrack}>
                  <div className={styles.budgetBarFill} style={{ width: `${budgetUtilization}%` }} />
                </div>
                <div className={styles.budgetLegendRow}>
                  <span>Spent: <strong>₹ {(project.spent / 10000000).toFixed(2)} Cr</strong></span>
                  <span>Balance: <strong>₹ {(remainingBudget / 10000000).toFixed(2)} Cr</strong></span>
                </div>
              </div>

              <div className={styles.budgetCategoriesList}>
                <div className={styles.budgetCatItem}>
                  <span>Civil Materials (Steel & Concrete)</span>
                  <strong>62%</strong>
                </div>
                <div className={styles.budgetCatItem}>
                  <span>Labour Wages & Muster Roll</span>
                  <strong>22%</strong>
                </div>
                <div className={styles.budgetCatItem}>
                  <span>Machinery Hire & Diesel Burn</span>
                  <strong>11%</strong>
                </div>
                <div className={styles.budgetCatItem}>
                  <span>Site Overheads & Safety/EHS</span>
                  <strong>5%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7 & 8: Health Alert & Quick Actions */}
          <div className={styles.twoColumnGrid}>
            <div className={styles.cardPanel}>
              <div className={styles.healthHeader}>
                <CheckCircle2 size={18} className={styles.healthIcon} />
                <h3 className={styles.panelTitle}>Project Health & Compliance</h3>
              </div>
              <p className={styles.healthText}>
                Project execution schedule is currently <strong>ON TRACK</strong>. No material shortages, structural hold-ups, or safety non-conformances reported for today's shifts.
              </p>
              <div className={styles.healthPillList}>
                <span className={styles.healthPill}>✓ EHS Compliance: 100%</span>
                <span className={styles.healthPill}>✓ QA/QC Cube Tests: Passed</span>
                <span className={styles.healthPill}>✓ Municipal NOCs: Active</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={styles.quickActionsPanel}>
              <h3 className={styles.quickActionTitle}>Site Quick Actions</h3>
              <div className={styles.quickActionBtnsGrid}>
                <button onClick={() => setShowPhotoModal(true)} className={styles.quickActionBtn}>
                  <ImageIcon size={15} />
                  <span>+ Add Site Photo</span>
                </button>
                <button onClick={() => setShowProgressModal(true)} className={styles.quickActionBtn}>
                  <TrendingUp size={15} />
                  <span>+ Update Progress</span>
                </button>
                <button onClick={() => setShowReportModal(true)} className={styles.quickActionBtn}>
                  <HardHat size={15} />
                  <span>+ Create Daily Report</span>
                </button>
                <Link href="/admin/expenses" className={styles.quickActionBtn}>
                  <DollarSign size={15} />
                  <span>+ Add Expense</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GALLERY (PROJECT-SPECIFIC PHOTO REPOSITORY)
          ======================================================== */}
      {activeTab === 'gallery' && (
        <div className={styles.tabContentArea}>
          <div className={styles.tabHeaderActionRow}>
            <div>
              <h3 className={styles.tabHeaderTitle}>Site Visual Documentation</h3>
              <p className={styles.tabHeaderDesc}>Timestamped progress photographs strictly scoped to {project.name}.</p>
            </div>
            <button onClick={() => setShowPhotoModal(true)} className={styles.primaryActionBtn}>
              <Upload size={15} />
              <span>Upload Site Photo</span>
            </button>
          </div>

          <div className={styles.galleryGrid}>
            {(project.gallery || []).map((img, idx) => (
              <div 
                key={img.id} 
                className={styles.galleryCard}
                onClick={() => setLightboxIndex(idx)}
              >
                <div className={styles.galleryImgWrapper}>
                  <SafeImage 
                    src={img.url} 
                    alt={img.caption} 
                    fallbackType="project"
                    className={styles.galleryImg}
                  />
                  <span className={styles.galleryTag}>{img.sectionTag}</span>
                </div>
                <div className={styles.galleryCardBody}>
                  <strong className={styles.galleryCaption}>{img.caption}</strong>
                  <div className={styles.galleryMeta}>
                    <span>{img.uploadedAt}</span>
                    <span>• {img.uploadedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Fullscreen Viewer */}
          {lightboxIndex !== null && project.gallery && project.gallery[lightboxIndex] && (
            <div className={styles.lightboxBackdrop} onClick={() => setLightboxIndex(null)}>
              <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                <button onClick={() => setLightboxIndex(null)} className={styles.lightboxClose}>✕</button>
                <div className={styles.lightboxImgBox}>
                  <SafeImage 
                    src={project.gallery[lightboxIndex].url} 
                    alt={project.gallery[lightboxIndex].caption} 
                    fallbackType="project"
                    className={styles.lightboxImg}
                  />
                </div>
                <div className={styles.lightboxFooter}>
                  <div>
                    <h4 className={styles.lightboxCaption}>{project.gallery[lightboxIndex].caption}</h4>
                    <span className={styles.lightboxInfo}>
                      Section: {project.gallery[lightboxIndex].sectionTag} • Uploaded {project.gallery[lightboxIndex].uploadedAt} by {project.gallery[lightboxIndex].uploadedBy}
                    </span>
                  </div>
                  <div className={styles.lightboxNav}>
                    <button 
                      disabled={lightboxIndex === 0}
                      onClick={() => setLightboxIndex(lightboxIndex - 1)}
                      className={styles.lightboxNavBtn}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span>{lightboxIndex + 1} / {project.gallery.length}</span>
                    <button 
                      disabled={lightboxIndex === project.gallery.length - 1}
                      onClick={() => setLightboxIndex(lightboxIndex + 1)}
                      className={styles.lightboxNavBtn}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: PROGRESS (MILESTONES & CATEGORY PROGRESS)
          ======================================================== */}
      {activeTab === 'progress' && (
        <div className={styles.tabContentArea}>
          <div className={styles.tabHeaderActionRow}>
            <div>
              <h3 className={styles.tabHeaderTitle}>Civil Execution Milestones</h3>
              <p className={styles.tabHeaderDesc}>Stage-by-stage engineering milestones and delivery schedule.</p>
            </div>
            <button onClick={() => setShowProgressModal(true)} className={styles.primaryActionBtn}>
              <Plus size={15} />
              <span>Update Overall Progress</span>
            </button>
          </div>

          <div className={styles.cardPanel}>
            {/* Desktop Table View */}
            <div className={styles.desktopTableView}>
              <div className={styles.milestonesTableWrapper}>
                <table className={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th>Milestone Name</th>
                      <th>Category</th>
                      <th>Target Date</th>
                      <th>Status</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.milestones || []).map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.category}</td>
                        <td>{m.targetDate}</td>
                        <td>
                          <span className={`${styles.statusBadgeSmall} ${styles[m.status.toLowerCase().replace(' ', '')]}`}>
                            ● {m.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.tableProgressInline}>
                            <div className={styles.progressTrackSmall}>
                              <div className={styles.progressFillSmall} style={{ width: `${m.completionPercent}%` }} />
                            </div>
                            <span>{m.completionPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Android Mobile Card View */}
            <div className={styles.mobileCardList}>
              {(project.milestones || []).map(m => (
                <div key={m.id} className={styles.mobileDataCard}>
                  <div className={styles.mobileCardHeaderRow}>
                    <strong className={styles.mobileCardTitle}>{m.name}</strong>
                    <span className={`${styles.statusBadgeSmall} ${styles[m.status.toLowerCase().replace(' ', '')]}`}>
                      ● {m.status}
                    </span>
                  </div>
                  <div className={styles.mobileCardMetaRow}>
                    <span>Category: <strong>{m.category}</strong></span>
                    <span>Target: <strong>{m.targetDate}</strong></span>
                  </div>
                  <div className={styles.tableProgressInline} style={{ marginTop: '4px' }}>
                    <div className={styles.progressTrackSmall} style={{ flex: 1, width: 'auto' }}>
                      <div className={styles.progressFillSmall} style={{ width: `${m.completionPercent}%` }} />
                    </div>
                    <span>{m.completionPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: TIMELINE (CHRONOLOGICAL STAGES)
          ======================================================== */}
      {activeTab === 'timeline' && (
        <div className={styles.tabContentArea}>
          <div className={styles.cardPanel}>
            <h3 className={styles.tabHeaderTitle}>Project Master Timeline</h3>
            <div className={styles.timelineList}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineMarkerCompleted} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineDate}>{project.startDate}</span>
                  <strong className={styles.timelineTitle}>Site Mobilization & Excavation</strong>
                  <p className={styles.timelineDesc}>Initial soil profiling, boundary fencing, and batching plant commissioning.</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineMarkerCompleted} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineDate}>15 Apr 2026</span>
                  <strong className={styles.timelineTitle}>Substructure Completion</strong>
                  <p className={styles.timelineDesc}>Raft foundation concreting and retaining wall waterproofing sign-off.</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineMarkerActive} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineDate}>Current Phase (Nov 2026)</span>
                  <strong className={styles.timelineTitle}>Superstructure RCC Frame (Active)</strong>
                  <p className={styles.timelineDesc}>Intermediate slab casting, column reinforcement, and safety netting.</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineMarkerPending} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineDate}>{project.expectedCompletion}</span>
                  <strong className={styles.timelineTitle}>Scheduled Handover & Client Commissioning</strong>
                  <p className={styles.timelineDesc}>Statutory occupancy certificates and final architectural snag rectifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: BUDGET (FINANCIAL LEDGER)
          ======================================================== */}
      {activeTab === 'budget' && (
        <div className={styles.tabContentArea}>
          <div className={styles.cardPanel}>
            <h3 className={styles.tabHeaderTitle}>Financial Account Ledger</h3>
            <div className={styles.budgetKpiSummary}>
              <div className={styles.budgetKpiTile}>
                <span>Contract Value</span>
                <strong>₹ {(project.budget / 10000000).toFixed(2)} Cr</strong>
              </div>
              <div className={styles.budgetKpiTile}>
                <span>Disbursed to Date</span>
                <strong style={{ color: '#167C72' }}>₹ {(project.spent / 10000000).toFixed(2)} Cr</strong>
              </div>
              <div className={styles.budgetKpiTile}>
                <span>Unutilized Balance</span>
                <strong style={{ color: '#B58B59' }}>₹ {(remainingBudget / 10000000).toFixed(2)} Cr</strong>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className={styles.desktopTableView}>
              <div className={styles.tableResponsiveContainer}>
                <table className={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th>Voucher #</th>
                      <th>Expense Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>VCH-EXP-091</td>
                      <td>Hydraulic Equipment</td>
                      <td>Transit mixer diesel and pump hose replacement</td>
                      <td>₹ 48,000</td>
                      <td><span className={styles.statusBadgeSmall}>● Authorized</span></td>
                    </tr>
                    <tr>
                      <td>VCH-EXP-088</td>
                      <td>Civil Reinforcement</td>
                      <td>Binding wire and 16mm TMT rebar consignment (35T)</td>
                      <td>₹ 1,85,000</td>
                      <td><span className={styles.statusBadgeSmall}>● Authorized</span></td>
                    </tr>
                    <tr>
                      <td>VCH-EXP-084</td>
                      <td>Workforce Payroll</td>
                      <td>Fortnightly labor wage settlement via NEFT</td>
                      <td>₹ 3,42,000</td>
                      <td><span className={styles.statusBadgeSmall}>● Authorized</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Android Mobile Card View */}
            <div className={styles.mobileCardList}>
              {[
                { vch: 'VCH-EXP-091', cat: 'Hydraulic Equipment', desc: 'Transit mixer diesel and pump hose replacement', amt: '₹ 48,000', status: 'Authorized' },
                { vch: 'VCH-EXP-088', cat: 'Civil Reinforcement', desc: 'Binding wire and 16mm TMT rebar consignment (35T)', amt: '₹ 1,85,000', status: 'Authorized' },
                { vch: 'VCH-EXP-084', cat: 'Workforce Payroll', desc: 'Fortnightly labor wage settlement via NEFT', amt: '₹ 3,42,000', status: 'Authorized' }
              ].map((v, i) => (
                <div key={i} className={styles.mobileDataCard}>
                  <div className={styles.mobileCardHeaderRow}>
                    <strong className={styles.mobileCardTitle}>{v.vch}</strong>
                    <span className={styles.statusBadgeSmall}>● {v.status}</span>
                  </div>
                  <div className={styles.mobileCardMetaRow}>
                    <span>Category: <strong>{v.cat}</strong></span>
                    <span style={{ color: '#167C72', fontWeight: 800 }}>{v.amt}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: TEAM (STAFF & WORKFORCE)
          ======================================================== */}
      {activeTab === 'team' && (
        <div className={styles.tabContentArea}>
          <div className={styles.cardPanel}>
            <h3 className={styles.tabHeaderTitle}>Project Engineering & Labor Deployment</h3>
            <div className={styles.teamGrid}>
              <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>PM</div>
                <div className={styles.teamInfo}>
                  <strong className={styles.teamName}>{project.projectManager}</strong>
                  <span className={styles.teamRole}>Project Manager (PMC Head)</span>
                  <span className={styles.teamContact}>Authorized Signatory</span>
                </div>
              </div>

              <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>SS</div>
                <div className={styles.teamInfo}>
                  <strong className={styles.teamName}>{project.projectSupervisor || 'Er. Pravin Gaikwad'}</strong>
                  <span className={styles.teamRole}>Lead Site Supervisor</span>
                  <span className={styles.teamContact}>Shift In-charge</span>
                </div>
              </div>

              <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>SO</div>
                <div className={styles.teamInfo}>
                  <strong className={styles.teamName}>Er. Vikas Sawant</strong>
                  <span className={styles.teamRole}>EHS & Safety Officer</span>
                  <span className={styles.teamContact}>Zero Incident Lead</span>
                </div>
              </div>

              <div className={styles.teamCard}>
                <div className={styles.teamAvatar}>QA</div>
                <div className={styles.teamInfo}>
                  <strong className={styles.teamName}>Er. Neha Deshpande</strong>
                  <span className={styles.teamRole}>QA/QC Materials Engineer</span>
                  <span className={styles.teamContact}>Testing Lab Lead</span>
                </div>
              </div>
            </div>

            {/* Assigned Project Site Workforce */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A', fontWeight: 700 }}>
                    Active Site Tradespersons & Crew Roster ({projectWorkers.length} Workers Assigned)
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Workers officially mobilized to {project.name} under {project.projectSupervisor || 'Lead Supervisor'}
                  </span>
                </div>
                <Link 
                  href="/admin/workforce" 
                  style={{
                    background: '#167C72',
                    color: '#FFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  <span>Allocate / Manage Workers</span>
                </Link>
              </div>

              {projectWorkers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <Users size={32} color="#94A3B8" style={{ margin: '0 auto 0.5rem auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#334155' }}>No Workers Currently Assigned</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Use the Workforce Directory or Project Allocation to assign tradespersons to this site.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  {projectWorkers.map(w => (
                    <div 
                      key={w.id} 
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <Link 
                          href={`/admin/workforce/${w.id}`}
                          style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}
                        >
                          {w.name}
                        </Link>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B' }}>
                          {w.code} • {w.skill}
                        </span>
                        <span style={{ display: 'inline-block', marginTop: '2px', fontSize: '0.68rem', fontWeight: 700, color: '#167C72' }}>
                          ₹{w.dailyWage}/day • {w.category}
                        </span>
                      </div>
                      <Link 
                        href={`/admin/workforce/${w.id}`}
                        style={{ fontSize: '0.72rem', color: '#167C72', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: MACHINERY (FLEET & ASSETS)
          ======================================================== */}
      {activeTab === 'machinery' && (
        <div className={styles.tabContentArea}>
          <div className={styles.cardPanel}>
            <h3 className={styles.tabHeaderTitle}>Heavy Machinery Deployed on Site</h3>
            <div className={styles.machineryGrid}>
              <div className={styles.machineCard}>
                <div className={styles.machineThumb}>
                  <SafeImage src="/images/jcb_real.jpg" alt="JCB 3DX" fallbackType="machine" className={styles.thumbImg} />
                </div>
                <div className={styles.machineContent}>
                  <strong className={styles.machineName}>JCB 3DX Super (MH 12 AB 4590)</strong>
                  <span className={styles.machineType}>Earthmoving Excavator</span>
                  <div className={styles.machineMeta}>
                    <span>Driver: Sunil Pawar</span>
                    <span>Status: Running (60L Diesel logged)</span>
                  </div>
                </div>
              </div>

              <div className={styles.machineCard}>
                <div className={styles.machineThumb}>
                  <SafeImage src="/images/crane_real.jpg" alt="Sany Crane" fallbackType="machine" className={styles.thumbImg} />
                </div>
                <div className={styles.machineContent}>
                  <strong className={styles.machineName}>Sany 75T Crawler Crane (MH 12 EF 9081)</strong>
                  <span className={styles.machineType}>Heavy Hoisting</span>
                  <div className={styles.machineMeta}>
                    <span>Operator: Santosh G.</span>
                    <span>Status: Tower Lift Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: DOCUMENTS (BLUEPRINTS, CONTRACTS, PERMITS)
          ======================================================== */}
      {activeTab === 'documents' && (
        <div className={styles.tabContentArea}>
          <div className={styles.cardPanel}>
            <h3 className={styles.tabHeaderTitle}>Project Engineering Documents & Clearances</h3>
            
            {/* Desktop Table View */}
            <div className={styles.desktopTableView}>
              <div className={styles.tableResponsiveContainer}>
                <table className={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Category</th>
                      <th>File Size</th>
                      <th>Upload Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.documents || []).map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <div className={styles.docTitleCell}>
                            <FileText size={16} className={styles.docIcon} />
                            <strong>{doc.name}</strong>
                          </div>
                        </td>
                        <td>{doc.category}</td>
                        <td>{doc.fileSize}</td>
                        <td>{doc.uploadedAt}</td>
                        <td>
                          <button className={styles.downloadBtn}>
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Android Mobile Card View */}
            <div className={styles.mobileCardList}>
              {(project.documents || []).map(doc => (
                <div key={doc.id} className={styles.mobileDataCard}>
                  <div className={styles.mobileCardHeaderRow}>
                    <div className={styles.docTitleCell}>
                      <FileText size={16} className={styles.docIcon} />
                      <strong className={styles.mobileCardTitle}>{doc.name}</strong>
                    </div>
                  </div>
                  <div className={styles.mobileCardMetaRow}>
                    <span>Type: <strong>{doc.category}</strong></span>
                    <span>Size: <strong>{doc.fileSize}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Uploaded: {doc.uploadedAt}</span>
                    <button className={styles.downloadBtn}>
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 9: DAILY REPORTS (DPR REPOSITORY)
          ======================================================== */}
      {activeTab === 'reports' && (
        <div className={styles.tabContentArea}>
          <div className={styles.tabHeaderActionRow}>
            <div>
              <h3 className={styles.tabHeaderTitle}>Daily Progress Reports (DPR)</h3>
              <p className={styles.tabHeaderDesc}>Certified daily shift execution logs for {project.name}.</p>
            </div>
            <button onClick={() => setShowReportModal(true)} className={styles.primaryActionBtn}>
              <Plus size={15} />
              <span>+ File Daily Report</span>
            </button>
          </div>

          <div className={styles.cardPanel}>
            {/* Desktop Table View */}
            <div className={styles.desktopTableView}>
              <div className={styles.tableResponsiveContainer}>
                <table className={styles.detailsTable}>
                  <thead>
                    <tr>
                      <th>DPR ID</th>
                      <th>Date & Shift</th>
                      <th>Work Summary</th>
                      <th>Workforce</th>
                      <th>Diesel (L)</th>
                      <th>Submitted By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.dailyReports || []).map(r => (
                      <tr key={r.id}>
                        <td><strong className={styles.dprIdBadge}>{r.id}</strong></td>
                        <td>{r.reportDate} ({r.shift})</td>
                        <td>{r.workExecuted}</td>
                        <td>{r.labourCount} Workers</td>
                        <td>{r.dieselConsumedLitres} L</td>
                        <td>{r.submittedBy}</td>
                        <td>
                          <span className={styles.statusBadgeSmall}>● {r.approvalStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Android Mobile Card View */}
            <div className={styles.mobileCardList}>
              {(project.dailyReports || []).map(r => (
                <div key={r.id} className={styles.mobileDataCard}>
                  <div className={styles.mobileCardHeaderRow}>
                    <strong className={styles.dprIdBadge}>{r.id}</strong>
                    <span className={styles.statusBadgeSmall}>● {r.approvalStatus}</span>
                  </div>
                  <div className={styles.mobileCardMetaRow}>
                    <span>Date: <strong>{r.reportDate}</strong> ({r.shift})</span>
                    <span>Staff: <strong>{r.labourCount} Workers</strong></span>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '0.74rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {r.workExecuted}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span>Fuel: <strong>{r.dieselConsumedLitres} L</strong></span>
                    <span>By: {r.submittedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS FOR ACTIONS (PHOTO, PROGRESS, REPORT)
          ======================================================== */}
      {/* Photo Modal */}
      {showPhotoModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowPhotoModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Upload Site Progress Photograph</h3>
              <button onClick={() => setShowPhotoModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handlePhotoUpload} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Photo Caption / Activity Detail *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5th floor column concreting" 
                  value={photoForm.caption}
                  onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Section Tag</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tower B / East Pier" 
                  value={photoForm.sectionTag}
                  onChange={e => setPhotoForm({ ...photoForm, sectionTag: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowPhotoModal(false)} className={styles.btnSecondary}>Cancel</button>
                <button type="submit" className={styles.btnPrimary}>Save Photo to Gallery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowProgressModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update Project Progress Percentage</h3>
              <button onClick={() => setShowProgressModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleProgressUpdate} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>New Progress Completion: {progressForm.newProgress}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progressForm.newProgress}
                  onChange={e => setProgressForm({ ...progressForm, newProgress: Number(e.target.value) })}
                  className={styles.rangeInput}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowProgressModal(false)} className={styles.btnSecondary}>Cancel</button>
                <button type="submit" className={styles.btnPrimary}>Commit Progress Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowReportModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create Daily Progress Report (DPR)</h3>
              <button onClick={() => setShowReportModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Shift</label>
                <select 
                  value={reportForm.shift} 
                  onChange={e => setReportForm({ ...reportForm, shift: e.target.value })}
                >
                  <option value="Shift-1 (Day)">Shift-1 (Day)</option>
                  <option value="Shift-2 (Night)">Shift-2 (Night)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Work Description Executed Today *</label>
                <textarea 
                  rows={2} 
                  placeholder="Detail cubic meters poured, reinforcement tied..." 
                  value={reportForm.workExecuted}
                  onChange={e => setReportForm({ ...reportForm, workExecuted: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Labour Count</label>
                  <input 
                    type="number" 
                    value={reportForm.labourCount}
                    onChange={e => setReportForm({ ...reportForm, labourCount: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Diesel Consumed (L)</label>
                  <input 
                    type="number" 
                    value={reportForm.fuelLitres}
                    onChange={e => setReportForm({ ...reportForm, fuelLitres: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowReportModal(false)} className={styles.btnSecondary}>Cancel</button>
                <button type="submit" className={styles.btnPrimary}>Submit DPR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
