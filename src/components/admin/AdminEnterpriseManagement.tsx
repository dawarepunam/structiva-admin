'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchStrapiCollection, syncOfflineQueue } from '@/services/strapiClient';

export interface EnterpriseSystemState {
  projects: any[];
  workers: any[];
  attendances: any[];
  fleets: any[];
  fuels: any[];
  expenses: any[];
  requests: any[];
  loading: boolean;
  lastSynced: string | null;
  refreshAll: () => Promise<void>;
}

const EnterpriseAdminContext = createContext<EnterpriseSystemState | null>(null);

export function useEnterpriseAdmin() {
  const context = useContext(EnterpriseAdminContext);
  if (!context) {
    throw new Error('useEnterpriseAdmin must be used within AdminEnterpriseManagement');
  }
  return context;
}

interface AdminEnterpriseManagementProps {
  children: React.ReactNode;
}

/**
 * AdminEnterpriseManagement
 * Master coordinating enterprise component for STRUCTIVA Admin OS.
 * Manages central data synchronization with Strapi v5, provides unified state to all admin routes,
 * and maintains audit integrity without duplicating individual page components.
 */
export default function AdminEnterpriseManagement({ children }: AdminEnterpriseManagementProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [fleets, setFleets] = useState<any[]>([]);
  const [fuels, setFuels] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const refreshAll = async () => {
    try {
      setLoading(true);
      const [prj, wrk, att, flt, ful, exp, req] = await Promise.all([
        fetchStrapiCollection('projects', []),
        fetchStrapiCollection('workers', []),
        fetchStrapiCollection('attendances', []),
        fetchStrapiCollection('fleets', []),
        fetchStrapiCollection('fuels', []),
        fetchStrapiCollection('expenses', []),
        fetchStrapiCollection('supervisor-requests', [])
      ]);

      setProjects(prj || []);
      setWorkers(wrk || []);
      setAttendances(att || []);
      setFleets(flt || []);
      setFuels(ful || []);
      setExpenses(exp || []);
      setRequests(req || []);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Auto-flush pending offline transactions
      await syncOfflineQueue();
    } catch (err) {
      console.error('Admin Enterprise coordination synchronization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <EnterpriseAdminContext.Provider
      value={{
        projects,
        workers,
        attendances,
        fleets,
        fuels,
        expenses,
        requests,
        loading,
        lastSynced,
        refreshAll
      }}
    >
      {children}
    </EnterpriseAdminContext.Provider>
  );
}
