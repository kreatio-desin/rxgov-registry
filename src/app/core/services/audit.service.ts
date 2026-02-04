import { Injectable } from '@angular/core';
import { OfflineStorageService } from './offline-storage.service';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  facilityId: string;
  action: 'patient_search' | 'patient_access' | 'attestation' | 'guest_dosing' | 'admit' | 'transfer' | 'terminate' | 'dosage_update' | 'sync';
  patientId?: string;
  resourceId?: string;
  status: 'success' | 'denied' | 'failed';
  reason?: string;
  details?: Record<string, any>;
}

export interface Attestation {
  id: string;
  timestamp: string;
  userId: string;
  patientId: string;
  facilityId: string;
  type: 'emergency' | 'guest_dosing';
  reason: string;
  approved: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private currentUserId: string = 'demo-user'; // Will be set by auth service
  private currentUserRole: string = 'clinical_staff';
  private currentFacilityId: string = 'demo-facility';

  constructor(private offlineStorage: OfflineStorageService) {}

  /**
   * Set current user context
   */
  setUserContext(userId: string, role: string, facilityId: string): void {
    this.currentUserId = userId;
    this.currentUserRole = role;
    this.currentFacilityId = facilityId;
  }

  /**
   * Log an action
   */
  async logAction(
    action: AuditLog['action'],
    status: 'success' | 'denied' | 'failed',
    options?: {
      patientId?: string;
      resourceId?: string;
      reason?: string;
      details?: Record<string, any>;
    }
  ): Promise<void> {
    const log: AuditLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: this.currentUserId,
      userRole: this.currentUserRole,
      facilityId: this.currentFacilityId,
      action,
      status,
      ...options
    };

    try {
      await this.offlineStorage.put('auditLogs', log);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  /**
   * Log patient search
   */
  async logPatientSearch(
    searchParams: { firstName: string; lastName: string; dateOfBirth: string },
    status: 'success' | 'denied' | 'failed'
  ): Promise<void> {
    await this.logAction('patient_search', status, {
      details: searchParams
    });
  }

  /**
   * Log patient access
   */
  async logPatientAccess(patientId: string, status: 'success' | 'denied'): Promise<void> {
    await this.logAction('patient_access', status, {
      patientId
    });
  }

  /**
   * Log attestation (Break Glass)
   */
  async logAttestation(
    patientId: string,
    type: 'emergency' | 'guest_dosing',
    reason: string,
    approved: boolean
  ): Promise<Attestation> {
    const attestation: Attestation = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: this.currentUserId,
      patientId,
      facilityId: this.currentFacilityId,
      type,
      reason,
      approved
    };

    const auditLog: AuditLog = {
      id: attestation.id,
      timestamp: attestation.timestamp,
      userId: attestation.userId,
      userRole: this.currentUserRole,
      facilityId: attestation.facilityId,
      action: 'attestation',
      patientId: attestation.patientId,
      status: approved ? 'success' : 'denied',
      details: {
        type,
        reason
      }
    };

    await this.offlineStorage.put('auditLogs', auditLog);

    return attestation;
  }

  /**
   * Log guest dosing
   */
  async logGuestDosing(
    patientId: string,
    dose: string,
    medication: string,
    facilitatingFacilityId: string
  ): Promise<void> {
    await this.logAction('guest_dosing', 'success', {
      patientId,
      details: {
        dose,
        medication,
        facilitatingFacilityId
      }
    });
  }

  /**
   * Log dosage update
   */
  async logDosageUpdate(
    patientId: string,
    oldDosage: string,
    newDosage: string
  ): Promise<void> {
    await this.logAction('dosage_update', 'success', {
      patientId,
      details: {
        oldDosage,
        newDosage
      }
    });
  }

  /**
   * Log sync
   */
  async logSync(recordsCount: number, status: 'success' | 'failed'): Promise<void> {
    await this.logAction('sync', status, {
      details: { recordsCount }
    });
  }

  /**
   * Get audit logs for patient
   */
  async getPatientAuditLogs(patientId: string): Promise<AuditLog[]> {
    try {
      const allLogs = await this.offlineStorage.getAll<AuditLog>('auditLogs');
      return allLogs.filter((log) => log.patientId === patientId);
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  /**
   * Get all audit logs
   */
  async getAllAuditLogs(): Promise<AuditLog[]> {
    try {
      return this.offlineStorage.getAll<AuditLog>('auditLogs');
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs by user
   */
  async getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
      return this.offlineStorage.getByIndex<AuditLog>('auditLogs', 'userId', userId);
    } catch (error) {
      console.error('Failed to get user audit logs:', error);
      return [];
    }
  }

  /**
   * Get attestations for patient
   */
  async getPatientAttestations(patientId: string): Promise<Attestation[]> {
    try {
      const allLogs = await this.offlineStorage.getAll<AuditLog>('auditLogs');
      return allLogs
        .filter((log) => log.action === 'attestation' && log.patientId === patientId)
        .map((log) => log as any as Attestation);
    } catch (error) {
      console.error('Failed to get attestations:', error);
      return [];
    }
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    const allLogs = await this.getAllAuditLogs();
    return allLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  private generateId(): string {
    return 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
