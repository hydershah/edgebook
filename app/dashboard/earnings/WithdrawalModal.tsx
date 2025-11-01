'use client';

import { useState } from 'react';
import { X, DollarSign, Building2, Wallet, Bitcoin, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WithdrawalModal({
  availableBalance,
  minimumThreshold,
  userId,
  onClose
}: {
  availableBalance: number;
  minimumThreshold: number;
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'BANK' | 'CRYPTO' | 'WHOP_BALANCE'>('BANK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= minimumThreshold && parsedAmount <= availableBalance;

  const handleSubmit = async () => {
    if (!isValidAmount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          method: payoutMethod,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process withdrawal request');
      }

      setSuccess(true);

      // Close modal and refresh page after 2 seconds
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return; // Prevent multiple decimal points
    if (parts[1] && parts[1].length > 2) return; // Max 2 decimal places
    setAmount(sanitized);
  };

  const setQuickAmount = (percentage: number) => {
    const quickAmount = (availableBalance * percentage).toFixed(2);
    setAmount(quickAmount);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-in zoom-in-95">
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-gray-600">
              Your request for ${parsedAmount.toFixed(2)} has been received and will be processed within 3-5 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Request Withdrawal</h2>
              <p className="text-sm text-gray-600 mt-1">
                Available balance: ${availableBalance.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  amount && !isValidAmount ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setAmount(minimumThreshold.toString())}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Min (${minimumThreshold})
              </button>
              <button
                onClick={() => setQuickAmount(0.25)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                25%
              </button>
              <button
                onClick={() => setQuickAmount(0.5)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                50%
              </button>
              <button
                onClick={() => setQuickAmount(1)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Max
              </button>
            </div>

            {/* Validation messages */}
            {amount && !isValidAmount && (
              <div className="mt-2 text-sm text-red-600">
                {parsedAmount < minimumThreshold
                  ? `Minimum withdrawal is $${minimumThreshold.toFixed(2)}`
                  : parsedAmount > availableBalance
                  ? `Amount exceeds available balance`
                  : 'Please enter a valid amount'}
              </div>
            )}
          </div>

          {/* Payout Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payout Method
            </label>
            <div className="space-y-2">
              {/* Bank Transfer */}
              <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                payoutMethod === 'BANK'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payoutMethod"
                  value="BANK"
                  checked={payoutMethod === 'BANK'}
                  onChange={() => setPayoutMethod('BANK')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <Building2 className={`mr-3 ${payoutMethod === 'BANK' ? 'text-emerald-600' : 'text-gray-400'}`} size={20} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Bank Transfer</div>
                  <div className="text-sm text-gray-600">Direct deposit to your bank account (3-5 days)</div>
                </div>
                {payoutMethod === 'BANK' && (
                  <Check className="text-emerald-600" size={20} />
                )}
              </label>

              {/* Crypto */}
              <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                payoutMethod === 'CRYPTO'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payoutMethod"
                  value="CRYPTO"
                  checked={payoutMethod === 'CRYPTO'}
                  onChange={() => setPayoutMethod('CRYPTO')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <Bitcoin className={`mr-3 ${payoutMethod === 'CRYPTO' ? 'text-emerald-600' : 'text-gray-400'}`} size={20} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Cryptocurrency</div>
                  <div className="text-sm text-gray-600">Receive USDC or ETH (1-2 hours)</div>
                </div>
                {payoutMethod === 'CRYPTO' && (
                  <Check className="text-emerald-600" size={20} />
                )}
              </label>

              {/* Whop Balance */}
              <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                payoutMethod === 'WHOP_BALANCE'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payoutMethod"
                  value="WHOP_BALANCE"
                  checked={payoutMethod === 'WHOP_BALANCE'}
                  onChange={() => setPayoutMethod('WHOP_BALANCE')}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <Wallet className={`mr-3 ${payoutMethod === 'WHOP_BALANCE' ? 'text-emerald-600' : 'text-gray-400'}`} size={20} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Whop Balance</div>
                  <div className="text-sm text-gray-600">Keep funds in your Whop account (instant)</div>
                </div>
                {payoutMethod === 'WHOP_BALANCE' && (
                  <Check className="text-emerald-600" size={20} />
                )}
              </label>
            </div>

            {/* Configure payment method link */}
            {(payoutMethod === 'BANK' || payoutMethod === 'CRYPTO') && (
              <button
                onClick={() => {
                  onClose();
                  router.push('/dashboard/settings/payout');
                }}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Configure {payoutMethod === 'BANK' ? 'bank details' : 'wallet address'}
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Fee Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">Processing Fee</p>
                <p className="text-amber-700">
                  A processing fee of 2.5% will be deducted from your withdrawal amount.
                  You will receive: <span className="font-semibold">
                    ${isValidAmount ? (parsedAmount * 0.975).toFixed(2) : '0.00'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidAmount || isSubmitting}
              className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all ${
                isValidAmount && !isSubmitting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Request $${isValidAmount ? parsedAmount.toFixed(2) : '0.00'}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}