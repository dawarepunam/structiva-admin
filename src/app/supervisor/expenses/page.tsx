import React from 'react';
import SupervisorExpensesWorkspace from '@/components/supervisor/expenses/SupervisorExpensesWorkspace';

export const metadata = {
  title: 'Site Expenses & Financial Control | Supervisor Portal | STRUCTIVA Enterprise OS',
  description: 'Manage on-site purchase vouchers, petty cash, vendor settlements, and audit-controlled financial workflow.'
};

export default function SupervisorExpensesPage() {
  return <SupervisorExpensesWorkspace />;
}
