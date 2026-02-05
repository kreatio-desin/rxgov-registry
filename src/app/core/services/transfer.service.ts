import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';

export interface PatientTransfer {
  id: string;
  patientId: string;
  patientName: string;
  sourceClinic: string;
  sourceFacilityId?: string;
  destinationClinic: string;
  destinationFacilityId: string;
  transferDate: string;
  transferNotes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private transferQueueSubject = new BehaviorSubject<PatientTransfer[]>([]);
  public transferQueue$ = this.transferQueueSubject.asObservable();
  private initializationPromise: Promise<void>;

  constructor(private offlineStorage: OfflineStorageService) {
    this.initializationPromise = this.initializeTransferStore();
  }

  /**
   * Initialize transfer storage
   */
  private async initializeTransferStore(): Promise<void> {
    await this.offlineStorage.ensureDbReady();
    await this.loadTransfers();
  }

  /**
   * Load all transfers into the subject
   */
  private async loadTransfers(): Promise<void> {
    const transfers = await this.offlineStorage.getAll<PatientTransfer>('transfers');
    this.transferQueueSubject.next(transfers);
  }

  /**
   * Initiate a patient transfer
   */
  async initiateTransfer(transfer: Omit<PatientTransfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientTransfer> {
    await this.initializationPromise;
    
    const newTransfer: PatientTransfer = {
      ...transfer,
      id: this.generateTransferId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };

    await this.offlineStorage.put('transfers', newTransfer);
    await this.loadTransfers();
    
    return newTransfer;
  }

  /**
   * Get all pending transfers for a facility
   */
  async getPendingTransfersForFacility(facilityId: string): Promise<PatientTransfer[]> {
    await this.initializationPromise;
    const transfers = await this.offlineStorage.getAll<PatientTransfer>('transfers');
    return transfers.filter(t => 
      t.destinationFacilityId === facilityId && t.status === 'pending'
    );
  }

  /**
   * Approve a transfer
   */
  async approveTransfer(transferId: string, approvedBy: string): Promise<PatientTransfer> {
    await this.initializationPromise;
    
    const transfer = await this.offlineStorage.get<PatientTransfer>('transfers', transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    transfer.status = 'approved';
    transfer.approvedAt = new Date().toISOString();
    transfer.approvedBy = approvedBy;
    transfer.updatedAt = new Date().toISOString();

    await this.offlineStorage.put('transfers', transfer);
    await this.loadTransfers();
    
    return transfer;
  }

  /**
   * Reject a transfer
   */
  async rejectTransfer(transferId: string, rejectionReason: string, rejectedBy: string): Promise<PatientTransfer> {
    await this.initializationPromise;
    
    const transfer = await this.offlineStorage.get<PatientTransfer>('transfers', transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    transfer.status = 'rejected';
    transfer.rejectionReason = rejectionReason;
    transfer.rejectedAt = new Date().toISOString();
    transfer.rejectedBy = rejectedBy;
    transfer.updatedAt = new Date().toISOString();

    await this.offlineStorage.put('transfers', transfer);
    await this.loadTransfers();
    
    return transfer;
  }

  /**
   * Get transfer by ID
   */
  async getTransfer(id: string): Promise<PatientTransfer | undefined> {
    await this.initializationPromise;
    return this.offlineStorage.get<PatientTransfer>('transfers', id);
  }

  /**
   * Get all transfers
   */
  async getAllTransfers(): Promise<PatientTransfer[]> {
    await this.initializationPromise;
    return this.offlineStorage.getAll<PatientTransfer>('transfers');
  }

  /**
   * Get transfers for a patient
   */
  async getPatientTransfers(patientId: string): Promise<PatientTransfer[]> {
    await this.initializationPromise;
    const transfers = await this.offlineStorage.getAll<PatientTransfer>('transfers');
    return transfers.filter(t => t.patientId === patientId);
  }

  /**
   * Get observable of all pending transfers
   */
  getPendingTransfers$(): Observable<PatientTransfer[]> {
    return new Observable(observer => {
      this.transferQueue$.subscribe(transfers => {
        observer.next(transfers.filter(t => t.status === 'pending'));
      });
    });
  }

  private generateTransferId(): string {
    return 'transfer-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
}
