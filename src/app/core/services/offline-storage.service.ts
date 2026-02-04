import { Injectable } from '@angular/core';

export interface StorageDatabase {
  patients: any[];
  facilities: any[];
  encounters: any[];
  dosages: any[];
  auditLogs: any[];
  syncQueue: any[];
  userConsents: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'rxgov-registry';
  private readonly DB_VERSION = 1;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initializeDatabase();
  }

  private initializeDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Patients store
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('lastName', 'lastName', { unique: false });
          patientStore.createIndex('firstName', 'firstName', { unique: false });
          patientStore.createIndex('ssn', 'ssn', { unique: false });
          patientStore.createIndex('registryId', 'registryId', { unique: true });
        }

        // Facilities store
        if (!db.objectStoreNames.contains('facilities')) {
          db.createObjectStore('facilities', { keyPath: 'id' });
        }

        // Encounters store
        if (!db.objectStoreNames.contains('encounters')) {
          const encounterStore = db.createObjectStore('encounters', { keyPath: 'id' });
          encounterStore.createIndex('patientId', 'patientId', { unique: false });
          encounterStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Dosages store
        if (!db.objectStoreNames.contains('dosages')) {
          const dosageStore = db.createObjectStore('dosages', { keyPath: 'id' });
          dosageStore.createIndex('patientId', 'patientId', { unique: false });
          dosageStore.createIndex('date', 'date', { unique: false });
        }

        // Audit logs store
        if (!db.objectStoreNames.contains('auditLogs')) {
          const auditStore = db.createObjectStore('auditLogs', { keyPath: 'id' });
          auditStore.createIndex('userId', 'userId', { unique: false });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        // User consents store
        if (!db.objectStoreNames.contains('userConsents')) {
          const consentStore = db.createObjectStore('userConsents', { keyPath: 'id' });
          consentStore.createIndex('patientId', 'patientId', { unique: false });
          consentStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async ensureDbReady(): Promise<void> {
    await this.dbPromise;
  }

  async add<T>(storeName: string, data: T): Promise<T> {
    await this.ensureDbReady();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<T> {
    await this.ensureDbReady();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: any): Promise<T | undefined> {
    await this.ensureDbReady();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}
