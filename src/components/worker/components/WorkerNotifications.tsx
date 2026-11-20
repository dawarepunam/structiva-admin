'use client';

import React, { useState } from 'react';
import styles from '../WorkerPortal.module.css';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardHat,
  Banknote,
  CalendarCheck2,
  Trash2
} from 'lucide-react';

export default function WorkerNotificationsView() {
  const [notifications, setNotifications] = useState([
    {
      id: 'N-01',
      title: 'Salary Advance Approved: ₹3,000',
      message: 'Your advance request has been verified and disbursed to your SBI account.',
      category: 'Finance',
      time: '15 Nov 2026, 11:30 AM',
      read: false,
      icon: Banknote,
      color: '#059669'
    },
    {
      id: 'N-02',
      title: 'Work Order Updated: Level 14 Rebar Cage',
      message: 'Er. Pravin Gaikwad added structural inspection milestone for columns C12-C16.',
      category: 'Task',
      time: '19 Nov 2026, 08:45 AM',
      read: false,
      icon: HardHat,
      color: '#167C72'
    },
    {
      id: 'N-03',
      title: 'Mandatory Site Safety Tool-box Talk',
      message: 'All core structural workers must attend daily safety briefing at 08:15 AM sharp.',
      category: 'Safety',
      time: '18 Nov 2026, 05:40 PM',
      read: true,
      icon: AlertTriangle,
      color: '#D97706'
    },
    {
      id: 'N-04',
      title: 'October 2026 Payslip Generated',
      message: 'Your gross earnings of ₹20,010 have been processed by Central Accounts.',
      category: 'Payroll',
      time: '05 Nov 2026, 02:15 PM',
      read: true,
      icon: CalendarCheck2,
      color: '#2563EB'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div>
      <div className={styles.cardHeader} style={{ background: '#FFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#172B32' }}>
            Notifications & Site Announcements
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Shift alerts, wage disbursements, and supervisor instructions
          </div>
        </div>

        <button className={styles.btnSecondary} onClick={markAllRead}>
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className={styles.card} 
              style={{ 
                margin: 0, 
                borderLeft: `4px solid ${notif.color}`, 
                background: notif.read ? '#FFFFFF' : '#F9FBFB' 
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${notif.color}15`, color: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#172B32', fontSize: '0.95rem' }}>
                      {notif.title}
                    </div>
                    {!notif.read && (
                      <span className={`${styles.badge} ${styles.badgeInfo}`}>
                        New
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.45' }}>
                    {notif.message}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {notif.time} • Category: {notif.category}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
