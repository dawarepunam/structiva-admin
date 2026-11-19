'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './WorkerPortal.module.css';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Check,
  Send,
  Building,
  User,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity } from '@/services/strapiClient';

interface SiteIssueRecord {
  id: number;
  document_id?: string;
  documentId?: string;
  issue_reference?: string;
  title: string;
  project: string;
  site?: string;
  category?: string;
  priority: 'Critical' | 'High' | 'Standard';
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolution Submitted' | 'Closed' | 'On Hold' | 'Reopened';
  incident_time?: string;
  exact_location?: string;
  immediate_action?: string;
  safety_risk?: string;
  remarks?: string;
  admin_remarks?: string;
  submitted_by?: string;
  assigned_worker_id?: number;
  assigned_worker_name?: string;
  worker_remarks?: string;
  resolution_description?: string;
  audit_timeline_json?: string;
}

export default function WorkerPortalView() {
  const [worker, setWorker] = useState({
    id: 1,
    name: 'Ramesh Patil',
    skill: 'Master Bar Bender & Structural Mason',
    project: 'Skyline Commercial Complex (Tower A)'
  });

  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [issues, setIssues] = useState<SiteIssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [activeTask, setActiveTask] = useState<SiteIssueRecord | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [workerRemarks, setWorkerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      const [allReqs, allWrks] = await Promise.all([
        fetchStrapiCollection('supervisor-requests', []),
        fetchStrapiCollection('workers', [])
      ]);

      const siteIssues = (allReqs || []).filter((r: any) => 
        (r.request_type === 'Site Issue' || r.requestType === 'Site Issue')
      );

      setIssues(siteIssues);
      setAvailableWorkers(allWrks || []);
    } catch (err) {
      console.error('Failed to load worker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, []);

  // Filter tasks specifically assigned to current worker
  const myAssignedTasks = useMemo(() => {
    return issues.filter(i => {
      const matchId = i.assigned_worker_id === worker.id;
      const matchName = (i.assigned_worker_name || '').toLowerCase().includes(worker.name.toLowerCase());
      return matchId || matchName;
    });
  }, [issues, worker]);

  // Acknowledge Task Action
  const handleAcknowledge = async (task: SiteIssueRecord) => {
    try {
      setSubmitting(true);
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let audit: any[] = [];
      try {
        audit = JSON.parse(task.audit_timeline_json || '[]');
      } catch (e) {}

      audit.push({
        timestamp: timestampStr,
        actor: `${worker.name} (Trade Worker)`,
        action: 'Assignment Acknowledged',
        note: 'Mobilizing tools and materials to job location.'
      });

      const updateData = {
        status: 'In Progress',
        audit_timeline_json: JSON.stringify(audit)
      };

      const targetId = String(task.document_id || task.documentId || task.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);
      await loadWorkerData();
    } catch (err: any) {
      alert('Failed to acknowledge: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Resolution Action
  const handleSubmitResolution = async () => {
    if (!activeTask || !resolutionText.trim()) return;

    try {
      setSubmitting(true);
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let audit: any[] = [];
      try {
        audit = JSON.parse(activeTask.audit_timeline_json || '[]');
      } catch (e) {}

      audit.push({
        timestamp: timestampStr,
        actor: `${worker.name} (Trade Worker)`,
        action: 'Resolution Submitted',
        note: resolutionText
      });

      const updateData = {
        status: 'Resolution Submitted',
        resolution_description: resolutionText,
        worker_remarks: workerRemarks,
        audit_timeline_json: JSON.stringify(audit)
      };

      const targetId = String(activeTask.document_id || activeTask.documentId || activeTask.id);
      await updateStrapiEntity('supervisor-requests', targetId, updateData);

      setActiveTask(null);
      setResolutionText('');
      setWorkerRemarks('');
      await loadWorkerData();
    } catch (err: any) {
      alert('Failed to submit resolution: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Wrench size={24} />
            <span>Worker Field Tasks & Maintenance Desk</span>
          </h1>
          <p className={styles.subtitle}>
            Authorized trade work assignments, safety hazard rectification, and completion submittals.
          </p>
        </div>

        {/* Worker Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#FFFFFF', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #ECEBE5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={15} style={{ color: '#167C72' }} />
            <select
              style={{ background: 'transparent', border: 'none', fontWeight: 600, color: '#172B32', outline: 'none', cursor: 'pointer' }}
              value={worker.id}
              onChange={e => {
                const found = availableWorkers.find(w => w.id === Number(e.target.value));
                if (found) {
                  setWorker({
                    id: found.id,
                    name: found.name,
                    skill: found.skill || found.category,
                    project: found.assigned_project || worker.project
                  });
                }
              }}
            >
              {availableWorkers.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.skill || w.category})</option>
              ))}
            </select>
          </div>

          <button className={styles.btnSync} onClick={() => loadWorkerData()} title="Sync backend tasks">
            <RotateCcw size={15} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#172B32', marginBottom: '0.75rem' }}>
          My Assigned Field Tasks ({myAssignedTasks.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#667085' }}>
            Loading your assigned trade tasks...
          </div>
        ) : myAssignedTasks.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #ECEBE5', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#8391A1' }}>
            <CheckCircle2 size={40} style={{ color: '#059669', opacity: 0.8, marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#172B32' }}>No Active Tasks Assigned</div>
            <div style={{ fontSize: '0.84rem', color: '#667085' }}>
              All safety hazards and mechanical issues assigned to {worker.name} are completed or closed.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myAssignedTasks.map(task => {
              const refId = task.issue_reference || `ISS-${task.id}`;
              const isCrit = task.priority === 'Critical';

              return (
                <div key={task.id} className={styles.taskCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#167C72' }}>{refId}</span>
                        <span className={`${styles.priorityBadge} ${isCrit ? styles.priorityCritical : styles.priorityHigh}`}>
                          {task.priority}
                        </span>
                        <span className={styles.categoryBadge}>{task.category}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#172B32' }}>
                        {task.title}
                      </h3>
                    </div>

                    <div>
                      <span className={`${styles.statusBadge} ${task.status === 'Closed' ? styles.statusClosed : styles.statusProgress}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#F4F2EC', padding: '0.75rem', borderRadius: '7px', fontSize: '0.82rem', color: '#203A3B', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span><strong>Location:</strong> {task.exact_location || 'Site Core'}</span>
                      <span><strong>Project:</strong> {task.project}</span>
                      <span><strong>Reported By:</strong> {task.submitted_by}</span>
                    </div>
                    {task.safety_risk && (
                      <div style={{ color: '#C62828', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                        <ShieldAlert size={14} />
                        <span><strong>Safety Risk:</strong> {task.safety_risk}</span>
                      </div>
                    )}
                  </div>

                  {task.admin_remarks && (
                    <div style={{ background: '#E0F2F1', borderLeft: '3px solid #167C72', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#004D40', marginBottom: '0.75rem' }}>
                      <strong>Admin Instructions:</strong> {task.admin_remarks}
                    </div>
                  )}

                  {task.resolution_description && (
                    <div style={{ background: '#E8F5E9', borderLeft: '3px solid #2E7D32', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#1B5E20', marginBottom: '0.75rem' }}>
                      <strong>Resolution Submitted:</strong> {task.resolution_description}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    {task.status === 'Assigned' && (
                      <button className={styles.btnPrimary} onClick={() => handleAcknowledge(task)} disabled={submitting}>
                        <Check size={14} />
                        <span>Acknowledge & Start Work</span>
                      </button>
                    )}

                    {task.status === 'In Progress' && (
                      <button className={styles.btnPrimary} onClick={() => setActiveTask(task)}>
                        <Send size={14} />
                        <span>Submit Work Resolution</span>
                      </button>
                    )}

                    {task.status === 'Resolution Submitted' && (
                      <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} />
                        <span>Awaiting Supervisor / Admin Sign-off</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Submission Modal */}
      {activeTask && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#167C72', marginBottom: '0.75rem' }}>
              <Wrench size={20} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Submit Work Completion Resolution
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0 0 1rem 0' }}>
              Filing rectification completion for <strong>{activeTask.issue_reference}</strong> ({activeTask.title}).
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>
                Resolution Description & Work Executed *
              </label>
              <textarea
                style={{ width: '100%', minHeight: '80px', padding: '0.6rem', border: '1px solid #ECEBE5', borderRadius: '7px', fontSize: '0.84rem' }}
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
                placeholder="Explain the physical repair, parts replaced, scaffolding clamping restored, and tests performed..."
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#203A3B', marginBottom: '0.3rem' }}>
                Worker Remarks / Next Inspection Due
              </label>
              <input
                type="text"
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #ECEBE5', borderRadius: '7px', fontSize: '0.84rem' }}
                value={workerRemarks}
                onChange={e => setWorkerRemarks(e.target.value)}
                placeholder="e.g. Area cleared of debris, warning tape removed, 100% sound."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                style={{ background: '#F4F2EC', border: '1px solid #ECEBE5', padding: '0.55rem 1rem', borderRadius: '6px', fontWeight: 600, color: '#172B32', cursor: 'pointer' }}
                onClick={() => setActiveTask(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSubmitResolution}
                disabled={submitting || !resolutionText.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
