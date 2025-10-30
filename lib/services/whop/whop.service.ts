/**
 * Whop Payment Service
 * Handles all interactions with Whop API for payments, subscriptions, and payouts
 */

import crypto from 'crypto';

interface WhopPaymentParams {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, any>;
}

interface WhopSubscriptionParams {
  userId: string;
  planId: string;
  trialDays?: number;
  metadata: Record<string, any>;
}

interface WhopTransferParams {
  userId: string;
  amount: number;
  currency: string;
  method: 'bank' | 'crypto';
  destination: string;
  description: string;
}

interface WhopAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export class WhopService {
  private apiKey: string;
  private apiUrl: string;
  private webhookSecret: string;
  private appId: string;
  private environment: 'test' | 'production';

  constructor() {
    this.apiKey = process.env.WHOP_API_KEY || '';
    this.apiUrl = process.env.WHOP_API_URL || 'https://api.whop.com/v5';
    this.webhookSecret = process.env.WHOP_WEBHOOK_SECRET || '';
    this.appId = process.env.WHOP_APP_ID || '';
    this.environment = (process.env.WHOP_ENVIRONMENT as 'test' | 'production') || 'test';

    if (!this.apiKey) {
      console.warn('WHOP_API_KEY is not configured');
    }
  }

  /**
   * Make authenticated request to Whop API
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<WhopAPIResponse<T>> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Whop-App-Id': this.appId,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || 'WHOP_API_ERROR',
            message: data.message || 'Unknown error occurred',
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Whop API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  /**
   * Create a one-time payment charge
   */
  async chargeUser(params: WhopPaymentParams): Promise<WhopAPIResponse> {
    return this.request('/payments', 'POST', {
      user_id: params.userId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      metadata: params.metadata,
      capture: true,
    });
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(params: WhopSubscriptionParams): Promise<WhopAPIResponse> {
    return this.request('/subscriptions', 'POST', {
      user_id: params.userId,
      plan_id: params.planId,
      trial_period_days: params.trialDays || 0,
      metadata: params.metadata,
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<WhopAPIResponse> {
    return this.request(`/subscriptions/${subscriptionId}`, 'DELETE', {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<WhopAPIResponse> {
    return this.request(`/subscriptions/${subscriptionId}`, 'GET');
  }

  /**
   * Transfer money to a user (payout)
   */
  async transferToUser(params: WhopTransferParams): Promise<WhopAPIResponse> {
    return this.request('/transfers', 'POST', {
      destination: params.userId,
      amount: params.amount,
      currency: params.currency,
      transfer_method: params.method,
      destination_account: params.destination,
      description: params.description,
    });
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<WhopAPIResponse> {
    return this.request(`/payments/${paymentId}`, 'GET');
  }

  /**
   * List payments with filters
   */
  async listPayments(params?: {
    userId?: string;
    status?: string;
    limit?: number;
    startingAfter?: string;
  }): Promise<WhopAPIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('user_id', params.userId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startingAfter) queryParams.append('starting_after', params.startingAfter);

    const query = queryParams.toString();
    return this.request(`/payments${query ? '?' + query : ''}`, 'GET');
  }

  /**
   * Create a refund for a payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<WhopAPIResponse> {
    return this.request(`/payments/${paymentId}/refund`, 'POST', {
      amount,
      reason,
    });
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.error('WHOP_WEBHOOK_SECRET is not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): any {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return null;
    }
  }

  /**
   * Get transfer (payout) details
   */
  async getTransfer(transferId: string): Promise<WhopAPIResponse> {
    return this.request(`/transfers/${transferId}`, 'GET');
  }

  /**
   * List transfers with filters
   */
  async listTransfers(params?: {
    userId?: string;
    status?: string;
    limit?: number;
  }): Promise<WhopAPIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('user_id', params.userId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request(`/transfers${query ? '?' + query : ''}`, 'GET');
  }

  /**
   * Get account balance for a user
   */
  async getBalance(userId: string): Promise<WhopAPIResponse> {
    return this.request(`/balances/${userId}`, 'GET');
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.webhookSecret && this.appId);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      environment: this.environment,
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey,
      hasWebhookSecret: !!this.webhookSecret,
      hasAppId: !!this.appId,
    };
  }
}

// Export singleton instance
export const whopService = new WhopService();
