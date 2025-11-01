'use client';

import { useState } from 'react';
import { Building2, Bitcoin, Wallet, Check, AlertCircle, Save, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PayoutMethod = 'BANK' | 'CRYPTO' | 'WHOP_BALANCE' | 'PAYPAL';

interface PayoutMethodSelectorProps {
  currentMethod: PayoutMethod;
  cryptoWalletAddress?: string;
  bankAccountId?: string;
  whopAccountId?: string;
  userId: string;
}

export default function PayoutMethodSelector({
  currentMethod,
  cryptoWalletAddress,
  bankAccountId,
  whopAccountId,
  userId,
}: PayoutMethodSelectorProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(currentMethod);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Bank account form state
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // Crypto wallet form state
  const [cryptoWallet, setCryptoWallet] = useState(cryptoWalletAddress || '');
  const [cryptoNetwork, setCryptoNetwork] = useState<'ETH' | 'USDC'>('USDC');

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const payload: any = {
        payoutMethod: selectedMethod,
      };

      if (selectedMethod === 'CRYPTO') {
        if (!cryptoWallet) {
          throw new Error('Please enter a wallet address');
        }
        payload.cryptoWalletAddress = cryptoWallet;
        payload.cryptoNetwork = cryptoNetwork;
      } else if (selectedMethod === 'BANK') {
        if (!bankAccountNumber || !bankRoutingNumber || !bankAccountName) {
          throw new Error('Please fill in all bank account details');
        }
        payload.bankAccountNumber = bankAccountNumber;
        payload.bankRoutingNumber = bankRoutingNumber;
        payload.bankAccountName = bankAccountName;
      }

      const response = await fetch('/api/settings/payout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update payout settings');
      }

      setSuccess(true);
      setIsEditing(false);

      // Refresh page to show updated data
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Payout Method</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Check className="text-emerald-600" size={20} />
              <p className="text-sm font-medium text-emerald-900">
                Payout settings updated successfully!
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bank Transfer */}
            <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'BANK'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!isEditing ? 'cursor-default' : ''}`}>
              <input
                type="radio"
                name="payoutMethod"
                value="BANK"
                checked={selectedMethod === 'BANK'}
                onChange={() => setSelectedMethod('BANK')}
                className="sr-only"
                disabled={!isEditing}
              />
              <div className="flex items-center justify-between mb-2">
                <Building2 className={`${selectedMethod === 'BANK' ? 'text-emerald-600' : 'text-gray-400'}`} size={24} />
                {selectedMethod === 'BANK' && <Check className="text-emerald-600" size={20} />}
              </div>
              <div className="font-semibold text-gray-900">Bank Transfer</div>
              <div className="text-xs text-gray-600 mt-1">ACH or Wire</div>
              <div className="text-xs text-gray-500 mt-2">3-5 business days</div>
            </label>

            {/* Cryptocurrency */}
            <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'CRYPTO'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!isEditing ? 'cursor-default' : ''}`}>
              <input
                type="radio"
                name="payoutMethod"
                value="CRYPTO"
                checked={selectedMethod === 'CRYPTO'}
                onChange={() => setSelectedMethod('CRYPTO')}
                className="sr-only"
                disabled={!isEditing}
              />
              <div className="flex items-center justify-between mb-2">
                <Bitcoin className={`${selectedMethod === 'CRYPTO' ? 'text-emerald-600' : 'text-gray-400'}`} size={24} />
                {selectedMethod === 'CRYPTO' && <Check className="text-emerald-600" size={20} />}
              </div>
              <div className="font-semibold text-gray-900">Crypto</div>
              <div className="text-xs text-gray-600 mt-1">USDC or ETH</div>
              <div className="text-xs text-gray-500 mt-2">1-2 hours</div>
            </label>

            {/* Whop Balance */}
            <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'WHOP_BALANCE'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!isEditing ? 'cursor-default' : ''}`}>
              <input
                type="radio"
                name="payoutMethod"
                value="WHOP_BALANCE"
                checked={selectedMethod === 'WHOP_BALANCE'}
                onChange={() => setSelectedMethod('WHOP_BALANCE')}
                className="sr-only"
                disabled={!isEditing}
              />
              <div className="flex items-center justify-between mb-2">
                <Wallet className={`${selectedMethod === 'WHOP_BALANCE' ? 'text-emerald-600' : 'text-gray-400'}`} size={24} />
                {selectedMethod === 'WHOP_BALANCE' && <Check className="text-emerald-600" size={20} />}
              </div>
              <div className="font-semibold text-gray-900">Whop Balance</div>
              <div className="text-xs text-gray-600 mt-1">Keep in account</div>
              <div className="text-xs text-gray-500 mt-2">Instant</div>
            </label>
          </div>

          {/* Method-specific forms */}
          {isEditing && (
            <>
              {selectedMethod === 'BANK' && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Bank Account Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={bankRoutingNumber}
                        onChange={(e) => setBankRoutingNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456789"
                        maxLength={9}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        disabled={isSaving}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      Your bank account information is encrypted and stored securely. We use Plaid to verify account details.
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === 'CRYPTO' && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Cryptocurrency Wallet</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Network
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        cryptoNetwork === 'USDC'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="cryptoNetwork"
                          value="USDC"
                          checked={cryptoNetwork === 'USDC'}
                          onChange={() => setCryptoNetwork('USDC')}
                          className="sr-only"
                          disabled={isSaving}
                        />
                        <span className="font-medium">USDC (Stablecoin)</span>
                      </label>

                      <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        cryptoNetwork === 'ETH'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="cryptoNetwork"
                          value="ETH"
                          checked={cryptoNetwork === 'ETH'}
                          onChange={() => setCryptoNetwork('ETH')}
                          className="sr-only"
                          disabled={isSaving}
                        />
                        <span className="font-medium">Ethereum (ETH)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={cryptoWallet}
                      onChange={(e) => setCryptoWallet(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Warning:</strong> Please double-check your wallet address. Transactions sent to an incorrect address cannot be recovered.
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === 'WHOP_BALANCE' && (
                <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Whop Balance</h3>
                  <p className="text-sm text-gray-600">
                    Your earnings will remain in your Whop account balance. You can use these funds for Whop purchases or transfer them later.
                  </p>
                  {whopAccountId && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-sm text-emerald-800">
                        Whop account connected: <span className="font-mono">{whopAccountId}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Current configuration display when not editing */}
          {!isEditing && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Current Configuration</h3>

              {currentMethod === 'BANK' && (
                <div className="text-sm text-gray-600">
                  {bankAccountId ? (
                    <p>Bank account ending in <span className="font-mono">****{bankAccountId.slice(-4)}</span></p>
                  ) : (
                    <p className="text-amber-600">No bank account configured. Click Edit to add one.</p>
                  )}
                </div>
              )}

              {currentMethod === 'CRYPTO' && (
                <div className="text-sm text-gray-600">
                  {cryptoWalletAddress ? (
                    <p>Wallet: <span className="font-mono">{cryptoWalletAddress.slice(0, 6)}...{cryptoWalletAddress.slice(-4)}</span></p>
                  ) : (
                    <p className="text-amber-600">No wallet address configured. Click Edit to add one.</p>
                  )}
                </div>
              )}

              {currentMethod === 'WHOP_BALANCE' && (
                <div className="text-sm text-gray-600">
                  {whopAccountId ? (
                    <p>Whop account: <span className="font-mono">{whopAccountId}</span></p>
                  ) : (
                    <p>Funds will be kept in your Whop balance</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save/Cancel buttons when editing */}
        {isEditing && (
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedMethod(currentMethod);
                setError(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}