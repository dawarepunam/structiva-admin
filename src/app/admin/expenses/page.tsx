import React from 'react';
import ExpenseApproval from '@/components/admin/expenses/ExpenseApproval';
import styles from '../page.module.css';

export default function ExpensesPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Site Expenses & Approvals</h1>
          <p className={styles.pageSubtitle}>
            Review petty cash, hardware bills, and site expenditures with audit logs.
          </p>
        </div>
      </div>
      <ExpenseApproval />
    </div>
  );
}
