'use client';

import { AlertCircle, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

export default function MinimumThresholdBanner({
  currentBalance,
  threshold = 50
}: {
  currentBalance: number;
  threshold?: number;
}) {
  const remaining = threshold - currentBalance;
  const percentage = Math.min((currentBalance / threshold) * 100, 100);
  const isClose = percentage >= 75; // Within 25% of threshold

  return (
    <div className={`rounded-xl p-5 border-2 transition-all ${
      isClose
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-4">
        {isClose ? (
          <Target className="text-emerald-600 mt-0.5 flex-shrink-0" size={24} />
        ) : (
          <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={24} />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`font-semibold ${
                isClose ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {isClose
                  ? `Almost there! Just $${remaining.toFixed(2)} more to withdraw`
                  : `Minimum Withdrawal: $${threshold.toFixed(2)}`
                }
              </h3>
              <p className={`text-sm mt-1 ${
                isClose ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {isClose
                  ? 'You\'re close to reaching the minimum withdrawal threshold!'
                  : `You need $${remaining.toFixed(2)} more in earnings to request a withdrawal.`
                }
              </p>
            </div>

            {/* Progress percentage */}
            <div className={`text-2xl font-bold ${
              isClose ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {Math.floor(percentage)}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Current: ${currentBalance.toFixed(2)}</span>
              <span>Goal: ${threshold.toFixed(2)}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  isClose
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Tips to earn more */}
          <div className={`rounded-lg p-3 ${
            isClose ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`${
                isClose ? 'text-emerald-700' : 'text-amber-700'
              }`} size={16} />
              <span className={`text-sm font-semibold ${
                isClose ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                Ways to earn more:
              </span>
            </div>
            <ul className={`text-xs space-y-1 ${
              isClose ? 'text-emerald-800' : 'text-amber-800'
            }`}>
              <li className="flex items-start">
                <span className="mr-1">•</span>
                <span>Create premium picks with detailed analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-1">•</span>
                <span>Focus on your best-performing sports ({percentage >= 50 ? 'you\'re doing great!' : 'check your stats'})</span>
              </li>
              <li className="flex items-start">
                <span className="mr-1">•</span>
                <span>Build your following to increase pick sales</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <Link
              href="/createpick"
              className={`flex-1 px-4 py-2.5 text-center font-semibold rounded-lg transition-all ${
                isClose
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              Create a Pick
            </Link>
            <Link
              href="/dashboard/stats"
              className="flex-1 px-4 py-2.5 text-center font-semibold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              View Stats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}