import React from 'react';
import ProfileCorrectionRequestsView from '@/components/admin/workforce/ProfileCorrectionRequestsView';

export const metadata = {
  title: 'Worker Profile Correction Requests | Workforce Management | STRUCTIVA',
  description: 'Review and approve tradesperson personal details and profile photo correction requests.'
};

export default function WorkerCorrectionsPage() {
  return <ProfileCorrectionRequestsView />;
}
