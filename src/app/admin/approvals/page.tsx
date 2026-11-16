import React from 'react';
import ExpenseApproval from '@/components/admin/expenses/ExpenseApproval';
import styles from '../page.module.css';

export default function ApprovalsPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Executive Approval Desk</h1>
          <p className={styles.pageSubtitle}>
            Pending voucher authorization queue. Inspect invoices, field justifications, and grant sign-offs.
          </p>
        </div>
      </div>
      {/* onlyPending=true means only pending vouchers are shown here */}
      <ExpenseApproval onlyPending={true} />
    </div>
  );
}
