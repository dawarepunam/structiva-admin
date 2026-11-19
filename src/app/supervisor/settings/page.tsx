import React from 'react';
import SupervisorSettingsView from '@/components/supervisor/settings/SupervisorSettingsView';

export const metadata = {
  title: 'Supervisor Node Settings | STRUCTIVA Enterprise OS',
  description: 'Enterprise Settings, Strapi Backend Telemetry, Geofence & Offline Queue Management',
};

export default function SupervisorSettingsPage() {
  return <SupervisorSettingsView />;
}
