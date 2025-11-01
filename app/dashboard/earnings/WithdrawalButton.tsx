'use client';

import { useState } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import WithdrawalModal from './WithdrawalModal';

export default function WithdrawalButton({
  availableBalance,
  minimumThreshold = 50,
  userId
}: {
  availableBalance: number;
  minimumThreshold?: number;
  userId: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const canWithdraw = availableBalance >= minimumThreshold;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canWithdraw}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
          canWithdraw
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        title={!canWithdraw ? `Minimum withdrawal amount is $${minimumThreshold.toFixed(2)}` : 'Request a withdrawal'}
      >
        <DollarSign size={20} />
        Request Withdrawal
      </button>

      {showModal && (
        <WithdrawalModal
          availableBalance={availableBalance}
          minimumThreshold={minimumThreshold}
          userId={userId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}