import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PayoutMethodSelector from "@/components/settings/PayoutMethodSelector";
import Link from "next/link";
import { ArrowLeft, Shield, AlertCircle } from "lucide-react";

export default async function PayoutSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/settings/payout");
  }

  // Fetch user's current payout settings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      payoutMethod: true,
      cryptoWalletAddress: true,
      bankAccountId: true,
      whopAccountId: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/earnings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payout Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure how you receive your earnings
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Your payment information is secure</h3>
              <p className="text-sm text-blue-700">
                All payment details are encrypted and stored securely. We use bank-level encryption to protect your financial information.
                EdgeBook never has access to your full bank account or card details.
              </p>
            </div>
          </div>
        </div>

        {/* Payout Method Selector Component */}
        <PayoutMethodSelector
          currentMethod={(user?.payoutMethod as 'BANK' | 'CRYPTO' | 'WHOP_BALANCE' | 'PAYPAL') || 'BANK'}
          cryptoWalletAddress={user?.cryptoWalletAddress || undefined}
          bankAccountId={user?.bankAccountId || undefined}
          whopAccountId={user?.whopAccountId || undefined}
          userId={session.user.id}
        />

        {/* Important Information */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Important Information</h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Minimum withdrawal amount is $50.00</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Bank transfers typically take 3-5 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Cryptocurrency transfers are usually processed within 1-2 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>A 2.5% processing fee applies to all withdrawals</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can update your payout method at any time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Tax Information</h3>
          <p className="text-sm text-gray-600 mb-4">
            For US creators earning more than $600 per year, we&apos;re required to collect tax information and issue a 1099 form.
          </p>
          <Link
            href="/dashboard/settings/tax"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Update Tax Information →
          </Link>
        </div>
      </div>
    </div>
  );
}