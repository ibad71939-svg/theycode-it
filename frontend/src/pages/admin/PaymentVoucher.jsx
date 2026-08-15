import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import logo from '../../assets/logo.svg';

function voucherNumber(payment) {
  // Short, human-readable reference derived from the payment id — not a
  // secret, just something a student can read back over the phone.
  return `TCI-${payment.id.slice(0, 8).toUpperCase()}`;
}

export default function PaymentVoucher() {
  const { id } = useParams();
  const { token } = useAuth();
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get(`/admin/payments/${id}`, token).then(setPayment).catch((e) => setError(e.message));
  }, [id, token]);

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/admin/payments" className="text-brand-700 font-semibold text-sm mt-3 inline-block">← Back to Payments</Link>
      </div>
    );
  }

  if (!payment) return <LoadingSpinner fullScreen={false} />;

  const enrollment = payment.enrollment;
  const student = enrollment?.student;
  const course = enrollment?.batch?.course;
  const isPaid = payment.status === 'PAID';

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="no-print flex justify-between items-center mb-6">
        <Link to="/admin/payments" className="text-sm text-muted hover:text-ink">← Back to Payments</Link>
        <button
          onClick={() => window.print()}
          disabled={!isPaid}
          className="btn-primary text-sm px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isPaid ? 'Only paid vouchers can be printed' : ''}
        >
          Print Voucher
        </button>
      </div>

      {!isPaid && (
        <div className="no-print bg-warn-50 text-warn border border-warn/30 rounded-lg px-4 py-3 text-sm mb-6">
          This payment is currently <strong>{payment.status}</strong>, not PAID. Mark it paid from the Payments page before printing a voucher.
        </div>
      )}

      <div className="print-voucher card p-10 border-2 border-ink/10">
        <div className="flex justify-between items-start border-b-2 border-ink pb-6 mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="They Code It" className="w-10 h-10" />
            <div>
              <p className="font-display font-bold text-lg leading-tight">They Code It</p>
              <p className="text-xs text-muted">Computer Academy</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted uppercase tracking-wide">Payment Voucher</p>
            <p className="font-mono font-bold">{voucherNumber(payment)}</p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <span className={`pill text-sm ${isPaid ? 'bg-mint-50 text-mint-700' : 'bg-warn-50 text-warn'}`}>
            {isPaid ? 'PAID' : payment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-8">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Student Name</p>
            <p className="font-medium">{student?.user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Email</p>
            <p className="font-medium">{student?.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Course</p>
            <p className="font-medium">{course?.title || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Batch Schedule</p>
            <p className="font-medium">{enrollment?.batch?.schedule || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Payment Method</p>
            <p className="font-medium capitalize">{payment.method?.replace('_', ' ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Transaction Ref</p>
            <p className="font-medium">{payment.transactionRef || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Date Paid</p>
            <p className="font-medium">{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide font-mono mb-0.5">Voucher Printed</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border-t-2 border-ink pt-4 flex justify-between items-center mb-10">
          <p className="font-display font-bold text-lg">Amount Paid</p>
          <p className="font-display font-bold text-2xl">Rs {payment.amount?.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div>
            <div className="border-b border-ink/40 h-10" />
            <p className="text-xs text-muted mt-1">Student Signature</p>
          </div>
          <div>
            <div className="border-b border-ink/40 h-10" />
            <p className="text-xs text-muted mt-1">Authorized Signature (Academy)</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-10">
          This voucher confirms receipt of payment by They Code It. Please retain this for your records.
        </p>
      </div>
    </div>
  );
}
