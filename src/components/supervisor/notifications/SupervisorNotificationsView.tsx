'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './SupervisorNotifications.module.css';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  Truck,
  FileText,
  Receipt,
  AlertOctagon,
  CalendarCheck,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { fetchStrapiCollection, updateStrapiEntity } from '@/services/strapiClient';
import Link from 'next/link';

export interface SupervisorNotificationItem {
  id: string | number;
  documentId: string;
  title: string;
  category: 'Material' | 'DPR' | 'Finance' | 'Safety' | 'Attendance' | 'General';
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'Critical' | 'High' | 'Standard';
  relatedRoute: string;
  referenceId: string;
}

export default function SupervisorNotificationsView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<SupervisorNotificationItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Load from Strapi
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStrapiCollection<any>('supervisor-requests', []);
      const items: SupervisorNotificationItem[] = [];

      data.forEach((r) => {
        if (r.requestType === 'Supervisor Notification' && r.details) {
          const d = r.details;
          items.push({
            id: r.id,
            documentId: r.documentId,
            title: d.title || r.title,
            category: d.category || 'General',
            message: d.message || r.remarks || '',
            timestamp: d.timestamp || r.submittedDate || 'Today',
            read: r.status === 'Read' || d.read === true,
            priority: d.priority || r.priority || 'Standard',
            relatedRoute: d.relatedRoute || '/supervisor/dashboard',
            referenceId: d.referenceId || `NOTIF-${r.id}`
          });
        }
      });

      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications from Strapi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (notif: SupervisorNotificationItem) => {
    try {
      await updateStrapiEntity('supervisor-requests', notif.documentId, {
        status: 'Read',
        details: {
          ...notif,
          read: true
        }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.documentId === notif.documentId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);
    for (const item of unreadItems) {
      try {
        await updateStrapiEntity('supervisor-requests', item.documentId, {
          status: 'Read',
          details: { ...item, read: true }
        });
      } catch {}
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // KPI counts
  const kpiCounts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const critical = notifications.filter((n) => n.priority === 'Critical' || n.priority === 'High').length;
    const read = notifications.filter((n) => n.read).length;

    return { total, unread, critical, read };
  }, [notifications]);

  // Filtered List
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (tabFilter === 'UNREAD' && n.read) return false;
      if (tabFilter === 'READ' && !n.read) return false;

      if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.referenceId.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [notifications, tabFilter, categoryFilter, search]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Material':
        return <Truck size={18} color="#167C72" />;
      case 'DPR':
        return <FileText size={18} color="#D97706" />;
      case 'Finance':
        return <Receipt size={18} color="#047857" />;
      case 'Safety':
        return <AlertOctagon size={18} color="#DC2626" />;
      case 'Attendance':
        return <CalendarCheck size={18} color="#172B32" />;
      default:
        return <Bell size={18} color="#167C72" />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Banner Header */}
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>
            <Bell size={26} color="#FFFFFF" /> Notification Center
          </h1>
          <p>
            Real-time field intelligence, indent dispatches, DPR approvals, safety notices, and shift reminders.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleMarkAllAsRead} disabled={kpiCounts.unread === 0}>
            <Check size={14} /> Mark All as Read
          </button>
          <button className={styles.btnPrimary} onClick={loadNotifications} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Dynamic Summary Cards */}
      <div className={styles.kpiGrid}>
        <div
          className={`${styles.kpiCard} ${tabFilter === 'ALL' ? styles.kpiCardActive : ''}`}
          onClick={() => setTabFilter('ALL')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(23, 43, 50, 0.08)', color: '#172B32' }}>
            <Inbox size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Notifications</span>
            <span className={styles.kpiValue}>{kpiCounts.total}</span>
            <span className={styles.kpiSubtitle}>All historical site alerts</span>
          </div>
        </div>

        <div
          className={`${styles.kpiCard} ${tabFilter === 'UNREAD' ? styles.kpiCardActive : ''}`}
          onClick={() => setTabFilter('UNREAD')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(22, 124, 114, 0.12)', color: '#167C72' }}>
            <Bell size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Unread Notices</span>
            <span className={styles.kpiValue} style={{ color: '#167C72' }}>
              {kpiCounts.unread}
            </span>
            <span className={styles.kpiSubtitle}>Requires acknowledgement</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>High Priority Alerts</span>
            <span className={styles.kpiValue} style={{ color: '#DC2626' }}>
              {kpiCounts.critical}
            </span>
            <span className={styles.kpiSubtitle}>Safety & revision notices</span>
          </div>
        </div>

        <div
          className={`${styles.kpiCard} ${tabFilter === 'READ' ? styles.kpiCardActive : ''}`}
          onClick={() => setTabFilter('READ')}
        >
          <div className={styles.kpiIconWrapper} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Archived / Read</span>
            <span className={styles.kpiValue} style={{ color: '#047857' }}>
              {kpiCounts.read}
            </span>
            <span className={styles.kpiSubtitle}>Acknowledged messages</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchBox}>
          <Search size={16} color="#718096" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search notifications by title, reference, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Material">Material Indents</option>
          <option value="DPR">Daily Reports (DPR)</option>
          <option value="Finance">Site Expenses</option>
          <option value="Safety">Safety & Incidents</option>
          <option value="Attendance">Workforce Attendance</option>
        </select>
      </div>

      {/* Notification Cards List */}
      <div className={styles.notifList}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #ECEBE5',
              color: '#718096'
            }}
          >
            {loading ? 'Retrieving supervisor notifications from Strapi...' : 'No notifications match your filter.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`${styles.notifCard} ${!item.read ? styles.notifCardUnread : ''}`}
            >
              <div
                className={styles.notifIconBox}
                style={{
                  background:
                    item.category === 'Safety'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : item.category === 'Material'
                      ? 'rgba(22, 124, 114, 0.1)'
                      : item.category === 'Finance'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(23, 43, 50, 0.08)'
                }}
              >
                {getCategoryIcon(item.category)}
              </div>

              <div className={styles.notifMain}>
                <div className={styles.notifTopRow}>
                  <h3 className={styles.notifTitle}>{item.title}</h3>
                  <span className={styles.notifTime}>{item.timestamp}</span>
                </div>

                <p className={styles.notifMessage}>{item.message}</p>

                <div className={styles.notifBottomRow}>
                  <div className={styles.notifMetaPills}>
                    <span className={styles.badgeNeutral}>{item.category}</span>
                    <span
                      className={`${styles.badge} ${
                        item.priority === 'Critical'
                          ? styles.badgeDanger
                          : item.priority === 'High'
                          ? styles.badgeWarning
                          : styles.badgeSuccess
                      }`}
                    >
                      {item.priority}
                    </span>
                    <code style={{ fontSize: '0.74rem', color: '#167C72', fontWeight: 700 }}>
                      {item.referenceId}
                    </code>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!item.read && (
                      <button
                        className={styles.btnSecondary}
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => handleMarkAsRead(item)}
                      >
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                    <Link
                      href={item.relatedRoute}
                      className={styles.btnPrimary}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none' }}
                      onClick={() => {
                        if (!item.read) handleMarkAsRead(item);
                      }}
                    >
                      <span>Open Workspace</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
