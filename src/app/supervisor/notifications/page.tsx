import React from 'react';
import SupervisorNotificationsView from '@/components/supervisor/notifications/SupervisorNotificationsView';

export const metadata = {
  title: 'Notifications & Alerts | Supervisor Portal',
  description: 'Real-time field notifications, material dispatches, DPR approvals and shift alerts',
};

export default function SupervisorNotificationsPage() {
  return <SupervisorNotificationsView />;
}
