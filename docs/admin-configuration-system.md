# Admin Configuration System for EdgeBook Payments

## Overview

The admin configuration system provides a comprehensive interface for managing all payment-related settings, monitoring transactions, and controlling the platform's financial operations.

## 1. Admin Dashboard Structure

### Main Admin Routes
```
/admin
  ├── /dashboard                    // Overview and metrics
  ├── /payments
  │   ├── /config                   // Payment configuration
  │   ├── /transactions              // Transaction management
  │   ├── /refunds                   // Refund processing
  │   └── /reports                   // Financial reports
  ├── /users
  │   ├── /creators                  // Creator management
  │   ├── /subscribers               // Subscriber management
  │   └── /payouts                   // Payout management
  └── /settings
      ├── /platform-fees             // Fee configuration
      ├── /payment-methods            // Payment method settings
      └── /withdrawal-rules          // Withdrawal configuration
```

## 2. Configuration Management

### Platform Fee Configuration
```typescript
// app/admin/payments/config/page.tsx

interface PlatformFeeConfig {
  defaultPercentage: number;          // Default 15%
  minimumFee: number;                  // Min fee in cents
  maximumFee: number;                  // Max fee in cents

  // Creator-specific overrides
  creatorOverrides: {
    userId: string;
    customPercentage: number;
    reason: string;
    expiresAt?: Date;
  }[];

  // Tier-based fees
  tiers: {
    volumeThreshold: number;          // Monthly volume in cents
    percentage: number;                // Fee percentage for this tier
  }[];
}
```

### Dynamic Configuration API
```typescript
// app/api/admin/payments/config/route.ts

export async function GET(request: NextRequest) {
  // Check admin permissions
  const session = await getServerSession();
  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const config = await prisma.paymentConfiguration.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const updates = await request.json();

  // Validate configuration changes
  const schema = z.object({
    platformFeePercent: z.number().min(0).max(100).optional(),
    minPickPrice: z.number().min(0).optional(),
    maxPickPrice: z.number().min(0).optional(),
    minSubscriptionPrice: z.number().min(0).optional(),
    maxSubscriptionPrice: z.number().min(0).optional(),
    withdrawalMinimum: z.number().min(0).optional(),
    withdrawalEnabled: z.boolean().optional(),
  });

  const validated = schema.parse(updates);

  // Create new configuration record (keep history)
  const config = await prisma.paymentConfiguration.create({
    data: {
      ...validated,
      updatedBy: session.user.id
    }
  });

  // Log the change
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'PAYMENT_CONFIG_UPDATE',
      details: JSON.stringify({
        before: await prisma.paymentConfiguration.findFirst({
          where: { id: { not: config.id } },
          orderBy: { updatedAt: 'desc' }
        }),
        after: config
      })
    }
  });

  return NextResponse.json(config);
}
```

## 3. Admin UI Components

### Configuration Panel
```typescript
// app/admin/payments/config/ConfigurationPanel.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export function PaymentConfigurationPanel() {
  const [config, setConfig] = useState({
    platformFeePercent: 15,
    minPickPrice: 50,
    maxPickPrice: 1000000,
    minSubscriptionPrice: 499,
    maxSubscriptionPrice: 99999,
    withdrawalMinimum: 1000,
    withdrawalEnabled: true
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    const response = await fetch('/api/admin/payments/config');
    const data = await response.json();
    setConfig(data);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/payments/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Failed to update configuration');

      toast({
        title: 'Configuration updated',
        description: 'Payment settings have been saved successfully'
      });

    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Fee Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform Fee Percentage</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[config.platformFeePercent]}
                onValueChange={([value]) =>
                  setConfig({ ...config, platformFeePercent: value })
                }
                min={0}
                max={50}
                step={0.5}
                className="flex-1"
              />
              <span className="w-16 text-right">
                {config.platformFeePercent}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pick Pricing Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Pick Pricing Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Price</Label>
              <Input
                type="number"
                value={config.minPickPrice / 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minPickPrice: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="0.01"
              />
            </div>
            <div>
              <Label>Maximum Price</Label>
              <Input
                type="number"
                value={config.maxPickPrice / 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxPickPrice: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Pricing Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Pricing Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Monthly Price</Label>
              <Input
                type="number"
                value={config.minSubscriptionPrice / 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minSubscriptionPrice: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="0.01"
              />
            </div>
            <div>
              <Label>Maximum Monthly Price</Label>
              <Input
                type="number"
                value={config.maxSubscriptionPrice / 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxSubscriptionPrice: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Withdrawals</Label>
            <Switch
              checked={config.withdrawalEnabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, withdrawalEnabled: checked })
              }
            />
          </div>

          <div>
            <Label>Minimum Withdrawal Amount</Label>
            <Input
              type="number"
              value={config.withdrawalMinimum / 100}
              onChange={(e) =>
                setConfig({
                  ...config,
                  withdrawalMinimum: Math.round(parseFloat(e.target.value) * 100)
                })
              }
              prefix="$"
              step="0.01"
              disabled={!config.withdrawalEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
```

## 4. Transaction Management

### Transaction Dashboard
```typescript
// app/admin/payments/transactions/page.tsx

interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [stats, setStats] = useState({
    totalVolume: 0,
    platformFees: 0,
    creatorEarnings: 0,
    pendingPayouts: 0
  });

  // Transaction list with filters
  return (
    <div className="space-y-6">
      <TransactionStats stats={stats} />
      <TransactionFilters
        filters={filters}
        onFilterChange={setFilters}
      />
      <TransactionTable
        transactions={transactions}
        onRefund={handleRefund}
        onExport={handleExport}
      />
    </div>
  );
}
```

### Refund Processing
```typescript
// app/api/admin/refunds/route.ts

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { purchaseId, reason, amount } = await request.json();

  // Get purchase details
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { pick: true, user: true }
  });

  if (!purchase || purchase.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Invalid purchase' }, { status: 400 });
  }

  // Process refund with Whop
  const whop = new WhopService();
  const refund = await whop.refund({
    paymentId: purchase.whopPaymentId,
    amount: amount || purchase.amount,
    reason
  });

  // Update purchase record
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: amount < purchase.amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
      refundedAt: new Date(),
      refundAmount: amount || purchase.amount
    }
  });

  // Create refund transaction
  await prisma.transaction.create({
    data: {
      userId: purchase.userId,
      type: 'REFUND',
      amount: amount || purchase.amount,
      status: 'COMPLETED',
      referenceId: purchase.id,
      whopReferenceId: refund.id,
      description: `Refund for pick purchase: ${reason}`
    }
  });

  // Log the refund
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'REFUND_PROCESSED',
      details: JSON.stringify({
        purchaseId,
        amount: amount || purchase.amount,
        reason
      })
    }
  });

  return NextResponse.json({ success: true, refundId: refund.id });
}
```

## 5. User Configuration Options

### Creator Dashboard
```typescript
// app/dashboard/creator/settings/PaymentSettings.tsx

export function CreatorPaymentSettings() {
  const [settings, setSettings] = useState({
    subscriptionPrice: 999, // $9.99
    subscriptionEnabled: false,
    minPayout: 5000, // $50
    autoWithdraw: true,
    payoutMethod: 'BANK',
    cryptoWalletAddress: '',
    bankAccountId: ''
  });

  return (
    <div className="space-y-6">
      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Subscriptions</Label>
            <Switch
              checked={settings.subscriptionEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, subscriptionEnabled: checked })
              }
            />
          </div>

          {settings.subscriptionEnabled && (
            <div>
              <Label>Monthly Subscription Price</Label>
              <Input
                type="number"
                value={settings.subscriptionPrice / 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptionPrice: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="0.01"
                min="4.99"
                max="999.99"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You'll earn ${((settings.subscriptionPrice * 0.85) / 100).toFixed(2)} per subscriber after platform fees
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payout Method</Label>
            <RadioGroup
              value={settings.payoutMethod}
              onValueChange={(value) =>
                setSettings({ ...settings, payoutMethod: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BANK" id="bank" />
                <Label htmlFor="bank">Bank Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CRYPTO" id="crypto" />
                <Label htmlFor="crypto">Cryptocurrency</Label>
              </div>
            </RadioGroup>
          </div>

          {settings.payoutMethod === 'CRYPTO' && (
            <div>
              <Label>Wallet Address</Label>
              <Input
                value={settings.cryptoWalletAddress}
                onChange={(e) =>
                  setSettings({ ...settings, cryptoWalletAddress: e.target.value })
                }
                placeholder="0x..."
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Auto Withdraw</Label>
            <Switch
              checked={settings.autoWithdraw}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoWithdraw: checked })
              }
            />
          </div>

          {settings.autoWithdraw && (
            <div>
              <Label>Minimum Payout Threshold</Label>
              <Input
                type="number"
                value={settings.minPayout / 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minPayout: Math.round(parseFloat(e.target.value) * 100)
                  })
                }
                prefix="$"
                step="1"
                min="10"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Automatic payout when balance reaches this amount
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={saveSettings} className="w-full">
        Save Payment Settings
      </Button>
    </div>
  );
}
```

## 6. Analytics & Reporting

### Financial Dashboard
```typescript
// app/admin/dashboard/FinancialMetrics.tsx

interface FinancialMetrics {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };

  platformFees: {
    collected: number;
    pending: number;
  };

  payouts: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };

  subscriptions: {
    mrr: number;
    activeCount: number;
    churnRate: number;
    averageValue: number;
  };

  picks: {
    totalSold: number;
    averagePrice: number;
    conversionRate: number;
  };
}

export function FinancialDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics>();
  const [dateRange, setDateRange] = useState('month');

  return (
    <div className="grid gap-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(metrics?.revenue.today)}
          change={calculateChange(metrics?.revenue)}
        />
        <MetricCard
          title="Platform Fees"
          value={formatCurrency(metrics?.platformFees.collected)}
          subtitle={`${formatCurrency(metrics?.platformFees.pending)} pending`}
        />
        <MetricCard
          title="MRR"
          value={formatCurrency(metrics?.subscriptions.mrr)}
          subtitle={`${metrics?.subscriptions.activeCount} active`}
        />
        <MetricCard
          title="Pending Payouts"
          value={formatCurrency(metrics?.payouts.pending)}
          subtitle={`${metrics?.payouts.processing} processing`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <TransactionChart data={transactionData} />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-3 gap-6">
        <TopCreators limit={10} />
        <TopPicks limit={10} />
        <RecentTransactions limit={20} />
      </div>
    </div>
  );
}
```

### Export & Reports
```typescript
// app/api/admin/reports/export/route.ts

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'csv';
  const type = searchParams.get('type') || 'transactions';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Generate report data
  const data = await generateReport({
    type,
    dateFrom: from ? new Date(from) : undefined,
    dateTo: to ? new Date(to) : undefined
  });

  // Format based on requested type
  let output: string;
  let contentType: string;

  switch (format) {
    case 'csv':
      output = convertToCSV(data);
      contentType = 'text/csv';
      break;
    case 'json':
      output = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      break;
    case 'pdf':
      output = await generatePDF(data);
      contentType = 'application/pdf';
      break;
    default:
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  }

  // Return file download
  return new NextResponse(output, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="report-${type}-${Date.now()}.${format}"`
    }
  });
}
```

## 7. Security & Permissions

### Role-Based Access Control
```typescript
// lib/permissions/payment.permissions.ts

export const paymentPermissions = {
  // Admin permissions
  MANAGE_PAYMENT_CONFIG: 'manage_payment_config',
  VIEW_ALL_TRANSACTIONS: 'view_all_transactions',
  PROCESS_REFUNDS: 'process_refunds',
  MANAGE_PAYOUTS: 'manage_payouts',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',

  // Creator permissions
  VIEW_OWN_EARNINGS: 'view_own_earnings',
  REQUEST_WITHDRAWAL: 'request_withdrawal',
  MANAGE_SUBSCRIPTION_PRICE: 'manage_subscription_price',

  // User permissions
  PURCHASE_PICKS: 'purchase_picks',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_PURCHASE_HISTORY: 'view_purchase_history'
};

// Permission checks
export function canManagePayments(user: User): boolean {
  return user.role === 'ADMIN' ||
         hasPermission(user, paymentPermissions.MANAGE_PAYMENT_CONFIG);
}

export function canProcessRefunds(user: User): boolean {
  return user.role === 'ADMIN' ||
         hasPermission(user, paymentPermissions.PROCESS_REFUNDS);
}
```

### Audit Logging
```typescript
// lib/audit/payment-audit.ts

export async function logPaymentAction(
  userId: string,
  action: string,
  details: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      category: 'PAYMENT',
      details: JSON.stringify(details),
      ipAddress: getClientIp(),
      userAgent: getUserAgent(),
      timestamp: new Date()
    }
  });
}

// Usage example
await logPaymentAction(
  session.user.id,
  'REFUND_PROCESSED',
  {
    purchaseId: purchase.id,
    amount: refundAmount,
    reason: refundReason
  }
);
```

## 8. Monitoring & Alerts

### Alert Configuration
```typescript
// lib/monitoring/payment-alerts.ts

interface AlertRule {
  name: string;
  condition: (metrics: any) => boolean;
  message: (metrics: any) => string;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'slack' | 'discord')[];
}

const alertRules: AlertRule[] = [
  {
    name: 'high_failure_rate',
    condition: (metrics) => metrics.failureRate > 0.1,
    message: (metrics) => `Payment failure rate is ${(metrics.failureRate * 100).toFixed(2)}%`,
    severity: 'critical',
    channels: ['email', 'slack']
  },
  {
    name: 'large_refund',
    condition: (metrics) => metrics.lastRefundAmount > 10000,
    message: (metrics) => `Large refund processed: $${metrics.lastRefundAmount / 100}`,
    severity: 'warning',
    channels: ['email']
  },
  {
    name: 'payout_failures',
    condition: (metrics) => metrics.payoutFailures > 5,
    message: (metrics) => `${metrics.payoutFailures} payout failures in the last hour`,
    severity: 'critical',
    channels: ['email', 'slack']
  }
];
```

## 9. Implementation Checklist

### Phase 1: Foundation
- [ ] Create PaymentConfiguration model
- [ ] Build admin configuration API
- [ ] Implement configuration UI
- [ ] Add audit logging

### Phase 2: Transaction Management
- [ ] Transaction dashboard
- [ ] Refund processing system
- [ ] Transaction export functionality
- [ ] Search and filtering

### Phase 3: User Settings
- [ ] Creator payment settings
- [ ] Subscription pricing management
- [ ] Payout method configuration
- [ ] Withdrawal threshold settings

### Phase 4: Analytics
- [ ] Financial metrics dashboard
- [ ] Revenue charts
- [ ] Top performers tracking
- [ ] Report generation

### Phase 5: Security & Monitoring
- [ ] Permission system
- [ ] Audit trail
- [ ] Alert system
- [ ] Performance monitoring

## 10. Configuration Examples

### Default Configuration
```json
{
  "platformFeePercent": 15,
  "minPickPrice": 50,
  "maxPickPrice": 1000000,
  "minSubscriptionPrice": 499,
  "maxSubscriptionPrice": 99999,
  "withdrawalMinimum": 1000,
  "withdrawalEnabled": true,
  "paymentProvider": "whop"
}
```

### Environment Variables
```env
# Admin Configuration
ADMIN_EMAILS=admin@edgebook.com,support@edgebook.com
DEFAULT_PLATFORM_FEE=15
ENABLE_AUTO_WITHDRAWALS=true
MIN_WITHDRAWAL_AMOUNT=1000

# Alert Configuration
ALERT_EMAIL=alerts@edgebook.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```