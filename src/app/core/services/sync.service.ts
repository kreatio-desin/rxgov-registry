import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';
import { AuditService } from './audit.service';

export interface SyncQueueItem {
  id: string;
  type: 'dosage' | 'encounter' | 'patient_update' | 'guest_dosing';
  data: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  attempts: number;
  lastError?: string;
}

export interface SyncConfig {
  enabled: boolean;
  frequency: number; // in milliseconds
  maxRetries: number;
  retryDelay: number; // in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncConfigSubject = new BehaviorSubject<SyncConfig>({
    enabled: true,
    frequency: 60000, // 1 minute default
    maxRetries: 3,
    retryDelay: 5000
  });

  public syncConfig$ = this.syncConfigSubject.asObservable();

  private syncStatusSubject = new BehaviorSubject<{
    isSyncing: boolean;
    lastSync: string | null;
    pendingItems: number;
  }>({
    isSyncing: false,
    lastSync: null,
    pendingItems: 0
  });

  public syncStatus$ = this.syncStatusSubject.asObservable();

  private syncInterval: any = null;
  private isOnline = navigator.onLine;

  constructor(
    private offlineStorage: OfflineStorageService,
    private auditService: AuditService
  ) {
    this.initializeSyncListeners();
    this.startAutoSync();
  }

  /**
   * Initialize listeners for online/offline events
   */
  private initializeSyncListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost - using offline mode');
      this.isOnline = false;
    });
  }

  /**
   * Start auto-sync based on config
   */
  private startAutoSync(): void {
    const config = this.syncConfigSubject.value;
    if (!config.enabled) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && navigator.onLine) {
        this.triggerSync();
      }
    }, config.frequency);
  }

  /**
   * Set sync configuration
   */
  setSyncConfig(config: Partial<SyncConfig>): void {
    const current = this.syncConfigSubject.value;
    const updated = { ...current, ...config };
    this.syncConfigSubject.next(updated);

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.startAutoSync();
  }

  /**
   * Trigger sync manually (only for admin intervention)
   */
  async triggerSync(): Promise<void> {
    if (this.syncStatusSubject.value.isSyncing) {
      return; // Already syncing
    }

    const status = this.syncStatusSubject.value;
    this.syncStatusSubject.next({
      ...status,
      isSyncing: true
    });

    try {
      const queue = await this.offlineStorage.getAll<SyncQueueItem>('syncQueue');
      const pendingItems = queue.filter((item) => item.status === 'pending' || item.status === 'failed');

      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      const updatedQueue = await this.offlineStorage.getAll<SyncQueueItem>('syncQueue');
      const stillPending = updatedQueue.filter((item) => item.status === 'pending' || item.status === 'failed');

      this.syncStatusSubject.next({
        isSyncing: false,
        lastSync: new Date().toISOString(),
        pendingItems: stillPending.length
      });

      await this.auditService.logSync(updatedQueue.length, 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatusSubject.next({
        ...status,
        isSyncing: false
      });
      await this.auditService.logSync(0, 'failed');
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      // Simulate API call to PDMP or central registry
      // In production, this would be an HTTP request
      await this.simulateUpload(item);

      item.status = 'synced';
      item.lastError = undefined;
      await this.offlineStorage.put('syncQueue', item);
    } catch (error) {
      item.attempts += 1;
      const config = this.syncConfigSubject.value;

      if (item.attempts >= config.maxRetries) {
        item.status = 'failed';
        item.lastError = (error as Error).message;
      } else {
        item.status = 'pending';
        item.lastError = (error as Error).message;
      }

      await this.offlineStorage.put('syncQueue', item);
    }
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(
    type: SyncQueueItem['type'],
    data: any
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending',
      attempts: 0
    };

    await this.offlineStorage.put('syncQueue', item);

    // Update pending count
    const queue = await this.offlineStorage.getAll<SyncQueueItem>('syncQueue');
    const pending = queue.filter((i) => i.status === 'pending' || i.status === 'failed');
    const status = this.syncStatusSubject.value;
    this.syncStatusSubject.next({
      ...status,
      pendingItems: pending.length
    });

    return item;
  }

  /**
   * Get pending sync items
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    const queue = await this.offlineStorage.getAll<SyncQueueItem>('syncQueue');
    return queue.filter((item) => item.status === 'pending' || item.status === 'failed');
  }

  /**
   * Retry failed sync
   */
  async retrySync(itemId: string): Promise<void> {
    const item = await this.offlineStorage.get<SyncQueueItem>('syncQueue', itemId);
    if (item) {
      item.status = 'pending';
      item.attempts = 0;
      item.lastError = undefined;
      await this.offlineStorage.put('syncQueue', item);
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(): Promise<SyncQueueItem[]> {
    const queue = await this.offlineStorage.getAll<SyncQueueItem>('syncQueue');
    return queue.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Clear sync history
   */
  async clearSyncHistory(): Promise<void> {
    await this.offlineStorage.clear('syncQueue');
    const status = this.syncStatusSubject.value;
    this.syncStatusSubject.next({
      ...status,
      pendingItems: 0
    });
  }

  /**
   * Check if online
   */
  isOnlineNow(): boolean {
    return this.isOnline && navigator.onLine;
  }

  /**
   * Simulate API upload (replace with real HTTP call in production)
   */
  private simulateUpload(item: SyncQueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 5% failure rate for demo
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Simulated upload failure'));
        }
      }, 1000);
    });
  }

  private generateId(): string {
    return 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}
