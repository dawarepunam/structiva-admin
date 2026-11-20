'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Camera,
  MessageSquare,
  Building,
  Check
} from 'lucide-react';
import { WorkerTaskRecord } from '../data/workerTypes';
import { updateStrapiEntity } from '@/services/strapiClient';

interface WorkerTasksProps {
  tasks: WorkerTaskRecord[];
  onTaskUpdated?: () => void;
}

export default function WorkerTasksView({
  tasks,
  onTaskUpdated
}: WorkerTasksProps) {
  const [selectedTask, setSelectedTask] = useState<WorkerTaskRecord | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(75);
  const [workerRemarks, setWorkerRemarks] = useState('');
  const [completedQty, setCompletedQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleOpenUpdate = (task: WorkerTaskRecord) => {
    setSelectedTask(task);
    setWorkerRemarks(task.workerRemarks || '');
    setProgressPercent(task.status === 'In Progress' ? 75 : 25);
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);

    try {
      if (selectedTask.documentId) {
        await updateStrapiEntity('supervisor-requests', selectedTask.documentId, {
          status: progressPercent >= 100 ? 'Resolution Submitted' : 'In Progress',
          worker_remarks: workerRemarks
        });
      }
      setSubmitting(false);
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
        setSelectedTask(null);
        if (onTaskUpdated) onTaskUpdated();
      }, 1500);
    } catch {
      setSubmitting(false);
      setSelectedTask(null);
    }
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            My Assigned Tasks & Work Orders
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Site operations submittals and progress updates for supervisor sign-off
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: '1 1 240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span className={`${styles.badge} ${
                      task.priority === 'Critical' ? styles.badgeDanger :
                      task.priority === 'High' ? styles.badgeWarning :
                      styles.badgeInfo
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className={`${styles.badge} ${
                      task.status === 'Completed' || task.status === 'Resolution Submitted' ? styles.badgeSuccess :
                      task.status === 'In Progress' ? styles.badgeWarning :
                      styles.badgeInfo
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#172B32', fontWeight: 600 }}>
                    {task.title}
                  </h3>
                </div>

                <button 
                  className={styles.btnPrimary}
                  onClick={() => handleOpenUpdate(task)}
                  style={{ width: 'auto', minWidth: '160px', padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <CheckCircle2 size={16} /> Update Progress
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                {task.details || task.remarks || 'Follow standard structural reinforcement specifications.'}
              </p>

              <div style={{ background: '#F8F9FA', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#6B7280' }}>Location / Grid:</span>
                  <div style={{ fontWeight: 600, color: '#172B32' }}>{task.exactLocation || 'Level 14 Core Zone'}</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Assigned Supervisor:</span>
                  <div style={{ fontWeight: 600, color: '#172B32' }}>{task.assignedSupervisor || 'Er. Pravin Gaikwad'}</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Target Milestone:</span>
                  <div style={{ fontWeight: 600, color: '#172B32' }}>Pre-pour Structural Inspection</div>
                </div>
              </div>

              {task.workerRemarks && (
                <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', fontSize: '0.78rem', color: '#065F46' }}>
                  <strong>Last Worker Submittal:</strong> {task.workerRemarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.card} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
              No tasks currently pending. Check back later or notify your site supervisor.
            </p>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '10px', width: '100%', maxWidth: '520px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', color: '#172B32' }}>
              Update Task Progress
            </h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#167C72', marginBottom: '1.25rem' }}>
              {selectedTask.title}
            </div>

            {successModal ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#059669' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Progress Saved in Strapi</h4>
                <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.3rem' }}>
                  Supervisor Er. Pravin Gaikwad notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProgress}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    <span>Estimated Completion:</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100} 
                    step={5} 
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#167C72' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Completed Quantity (e.g., Tons, sqm, or units)
                  </label>
                  <input 
                    type="text" 
                    placeholder="E.g., 4 column cages bound with 32mm rebar"
                    value={completedQty}
                    onChange={(e) => setCompletedQty(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    Worker Remarks & Site Observations
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Explain work status, binding wire consumption or any impediments..."
                    value={workerRemarks}
                    onChange={(e) => setWorkerRemarks(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#F8F9FA', border: '1px dashed #D1D5DB', borderRadius: '6px', textAlign: 'center', cursor: 'pointer' }}>
                  <Camera size={24} color="#6B7280" style={{ margin: '0 auto 0.3rem auto' }} />
                  <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>Upload Progress Photo / Site Proof</div>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Click to select JPG / PNG from device camera</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className={styles.btnSecondary} 
                    onClick={() => setSelectedTask(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnPrimary} 
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : progressPercent >= 100 ? 'Submit for Sign-off' : 'Save Progress'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
