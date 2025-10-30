/**
 * Simple in-memory event emitter for broadcasting account status changes
 * Uses SSE (Server-Sent Events) for real-time notifications
 */

type StatusChangeListener = (data: AccountStatusChange) => void;

export interface AccountStatusChange {
  userId: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  suspendedUntil?: Date | null;
  suspensionReason?: string | null;
  banReason?: string | null;
  timestamp: Date;
}

class StatusBroadcastManager {
  private listeners: Map<string, Set<StatusChangeListener>> = new Map();

  /**
   * Subscribe to status changes for a specific user
   */
  subscribe(userId: string, listener: StatusChangeListener): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }

    this.listeners.get(userId)!.add(listener);

    // Return unsubscribe function
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        userListeners.delete(listener);
        if (userListeners.size === 0) {
          this.listeners.delete(userId);
        }
      }
    };
  }

  /**
   * Broadcast a status change to all listeners for a specific user
   */
  broadcast(change: AccountStatusChange): void {
    const userListeners = this.listeners.get(change.userId);
    if (userListeners) {
      userListeners.forEach(listener => {
        try {
          listener(change);
        } catch (error) {
          console.error('Error in status broadcast listener:', error);
        }
      });
    }
  }

  /**
   * Get count of active listeners for a user (for debugging)
   */
  getListenerCount(userId: string): number {
    return this.listeners.get(userId)?.size || 0;
  }

  /**
   * Get total active connections (for monitoring)
   */
  getTotalConnections(): number {
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.size;
    });
    return total;
  }
}

// Singleton instance
export const statusBroadcast = new StatusBroadcastManager();
