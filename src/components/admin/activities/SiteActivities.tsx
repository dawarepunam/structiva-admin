'use client';

import React, { useState } from 'react';
import styles from './SiteActivities.module.css';
import { 
  HardHat, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Camera, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Building2,
  Paperclip,
  Check
} from 'lucide-react';
import SafeImage from '@/components/admin/ui/SafeImage';

interface SiteActivityLog {
  id: string;
  project: string;
  location: string;
  date: string;
  time: string;
  supervisor: string;
  trade: string;
  description: string;
  workCompleted: string;
  workInProgress: string;
  progressPercent: number;
  status: 'Completed' | 'In Progress' | 'Delayed';
  image: string;
  labourCount: number;
}

const initialActivities: SiteActivityLog[] = [
  {
    id: 'ACT-091',
    project: 'Skyline Commercial Complex',
    location: 'Tower B, 4th Floor Slab',
    date: '17 Nov 2026',
    time: '02:30 PM',
    supervisor: 'Er. Pravin Gaikwad',
    trade: 'RCC & Concreting',
    description: 'Level 4 slab reinforcement tie-up completed. Ready-mix concrete batching (M-40) initiated with 2 transit mixers.',
    workCompleted: '145 m³ Concreting poured, 12 column cages tied.',
    workInProgress: 'Surface vibrator compaction and water curing setup.',
    progressPercent: 68,
    status: 'In Progress',
    image: '/images/commercial_tower.jpg',
    labourCount: 42
  },
  {
    id: 'ACT-092',
    project: 'Eastern Expressway Bridge Sec-4',
    location: 'Pier-4 & Pier-5 Segment',
    date: '17 Nov 2026',
    time: '11:15 AM',
    supervisor: 'Er. Rajesh Kulkarni',
    trade: 'Structural Pre-Stressing',
    description: 'Post-tensioning cable stressing executed on Segmental Box Girder span 4. Grouting completed under NHAI inspection.',
    workCompleted: '2 Spans cable pulled and anchored at 1800 kN.',
    workInProgress: 'Expansion joint shuttering on approach slab.',
    progressPercent: 84,
    status: 'Completed',
    image: '/images/highway_bridge.jpg',
    labourCount: 28
  },
  {
    id: 'ACT-093',
    project: 'Metro Line Corridor Piling',
    location: 'Pillar Location P-102 to P-105',
    date: '17 Nov 2026',
    time: '09:45 AM',
    supervisor: 'Er. Sunil Rao',
    trade: 'Deep Foundation Piling',
    description: 'Bored cast-in-situ piling (1200mm dia) down to 24m bedrock. Bentonite slurry flush completed.',
    workCompleted: '3 Bored piles casted and steel liner lowered.',
    workInProgress: 'Utility line shifting cleared with municipal authorities.',
    progressPercent: 42,
    status: 'In Progress',
    image: '/images/metro_piling.jpg',
    labourCount: 35
  }
];

export default function SiteActivities() {
  const [activities, setActivities] = useState<SiteActivityLog[]>(initialActivities);
  const [filterProject, setFilterProject] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // New Activity Form State
  const [formData, setFormData] = useState({
    project: 'Skyline Commercial Complex',
    location: '',
    supervisor: 'Er. Pravin Gaikwad',
    trade: 'Civil Concreting',
    description: '',
    workCompleted: '',
    workInProgress: '',
    progressPercent: 50,
    labourCount: 20
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.description) return;

    const newAct: SiteActivityLog = {
      id: `ACT-0${activities.length + 94}`,
      project: formData.project,
      location: formData.location,
      date: '17 Nov 2026',
      time: 'Just now',
      supervisor: formData.supervisor,
      trade: formData.trade,
      description: formData.description,
      workCompleted: formData.workCompleted || 'Work logged by site engineer',
      workInProgress: formData.workInProgress || 'Continuing next shift',
      progressPercent: Number(formData.progressPercent),
      status: Number(formData.progressPercent) >= 100 ? 'Completed' : 'In Progress',
      image: '/images/project2.jpg',
      labourCount: Number(formData.labourCount)
    };

    setActivities([newAct, ...activities]);
    setShowModal(false);
    setFormData({
      project: 'Skyline Commercial Complex',
      location: '',
      supervisor: 'Er. Pravin Gaikwad',
      trade: 'Civil Concreting',
      description: '',
      workCompleted: '',
      workInProgress: '',
      progressPercent: 50,
      labourCount: 20
    });
  };

  const filtered = filterProject === 'All' 
    ? activities 
    : activities.filter(a => a.project === filterProject);

  return (
    <div className={styles.container}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.filterGroup}>
          <div className={styles.filterBox}>
            <Filter size={15} className={styles.filterIcon} />
            <select 
              value={filterProject} 
              onChange={e => setFilterProject(e.target.value)}
              className={styles.selectInput}
            >
              <option value="All">All Construction Sites</option>
              <option value="Skyline Commercial Complex">Skyline Commercial Complex</option>
              <option value="Eastern Expressway Bridge Sec-4">Eastern Expressway Bridge Sec-4</option>
              <option value="Metro Line Corridor Piling">Metro Line Corridor Piling</option>
            </select>
          </div>
          <span className={styles.totalBadge}>{filtered.length} Live Field Logs</span>
        </div>

        <button onClick={() => setShowModal(true)} className={styles.logBtnPrimary}>
          <Plus size={16} />
          <span>+ Log Site Activity</span>
        </button>
      </div>

      {/* Activity Timeline Stream Cards */}
      <div className={styles.activityGrid}>
        {filtered.map(act => (
          <div key={act.id} className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerMeta}>
                <span className={styles.actId}>{act.id}</span>
                <span className={styles.timeTag}>
                  <Clock size={12} />
                  <span>{act.date} • {act.time}</span>
                </span>
              </div>
              <span className={`${styles.statusBadge} ${styles[act.status.toLowerCase().replace(' ', '')]}`}>
                ● {act.status}
              </span>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.mediaRow}>
                <div className={styles.thumbnailWrapper}>
                  <SafeImage 
                    src={act.image} 
                    alt={act.project} 
                    fallbackType="project"
                    className={styles.thumbnailImg}
                  />
                  <span className={styles.labourPill}>
                    <HardHat size={11} /> {act.labourCount} Workers
                  </span>
                </div>

                <div className={styles.infoCol}>
                  <h3 className={styles.actTitle}>{act.project}</h3>
                  <div className={styles.locRow}>
                    <MapPin size={13} className={styles.locIcon} />
                    <span>{act.location}</span>
                  </div>
                  <div className={styles.supervisorRow}>
                    <UserCheck size={13} className={styles.supIcon} />
                    <span>Supervisor: <strong>{act.supervisor}</strong> ({act.trade})</span>
                  </div>
                </div>
              </div>

              {/* Work Scope Details */}
              <div className={styles.descBox}>
                <p className={styles.descText}>{act.description}</p>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Execution Progress</span>
                  <span className={styles.progressVal}>{act.progressPercent}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${act.progressPercent}%` }} 
                  />
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Work Executed Today</span>
                  <p className={styles.detailVal}>{act.workCompleted}</p>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Work In Progress</span>
                  <p className={styles.detailVal}>{act.workInProgress}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Activity Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Log Daily Construction Activity</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Select Construction Site</label>
                  <select 
                    value={formData.project}
                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                    className={styles.input}
                  >
                    <option value="Skyline Commercial Complex">Skyline Commercial Complex</option>
                    <option value="Eastern Expressway Bridge Sec-4">Eastern Expressway Bridge Sec-4</option>
                    <option value="Metro Line Corridor Piling">Metro Line Corridor Piling</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Exact Site Location / Section</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tower B - 5th Floor Slab"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Site Supervisor Name</label>
                  <input 
                    type="text" 
                    value={formData.supervisor}
                    onChange={e => setFormData({ ...formData, supervisor: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Trade / Work Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. RCC Concreting / Shuttering"
                    value={formData.trade}
                    onChange={e => setFormData({ ...formData, trade: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Activity Summary & Field Remarks</label>
                <textarea 
                  rows={2}
                  placeholder="Detail the field work executed in today's shift..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={styles.textarea}
                  required
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Work Completed Today</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 140 m³ Concreting poured"
                    value={formData.workCompleted}
                    onChange={e => setFormData({ ...formData, workCompleted: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Work Ongoing / Next Shift</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Curing & column shuttering"
                    value={formData.workInProgress}
                    onChange={e => setFormData({ ...formData, workInProgress: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Progress Percentage ({formData.progressPercent}%)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={formData.progressPercent}
                    onChange={e => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                    className={styles.rangeInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Labour Deployed on this Activity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.labourCount}
                    onChange={e => setFormData({ ...formData, labourCount: Number(e.target.value) })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
