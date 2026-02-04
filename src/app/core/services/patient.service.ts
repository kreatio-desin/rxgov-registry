import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';

export interface Patient {
  id: string;
  registryId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string; // Last 4 only for display
  motherFirstName?: string;
  demographics?: {
    gender: string;
    race: string;
    ethnicity: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  currentEnrollment?: {
    facilityId: string;
    facilityName: string;
    moudType: string; // Methadone, Buprenorphine, etc.
    enrollmentDate: string;
    status: 'active' | 'inactive' | 'transferred' | 'terminated';
  };
  pdmpConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  type: 'no-match' | 'conditional-match' | 'unconditional-match';
  patient?: Patient;
  hash?: string; // For conditional match - no identifying data
  requiresAttestation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private currentPatientSubject = new BehaviorSubject<Patient | null>(null);
  public currentPatient$ = this.currentPatientSubject.asObservable();

  private patientAccessTokens = new Map<string, boolean>(); // patientId -> hasAccess

  constructor(private offlineStorage: OfflineStorageService) {}

  /**
   * Privacy-first patient search
   * Returns minimal data until attestation is provided
   */
  async searchPatient(
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    ssn?: string,
    motherFirstName?: string
  ): Promise<SearchResult> {
    // Search by name first
    const matchesByName = await this.offlineStorage.getByIndex<Patient>(
      'patients',
      'lastName',
      lastName
    );

    const exactMatches = matchesByName.filter(
      (p) =>
        p.firstName.toLowerCase() === firstName.toLowerCase() &&
        p.dateOfBirth === dateOfBirth
    );

    if (exactMatches.length === 0) {
      // No match found
      return {
        type: 'no-match',
        requiresAttestation: false
      };
    }

    const patient = exactMatches[0];

    // Check if patient has active enrollment elsewhere
    const isActiveElsewhere = patient.currentEnrollment?.status === 'active';

    if (isActiveElsewhere && !this.hasAccessToken(patient.id)) {
      // Conditional match - requires attestation
      return {
        type: 'conditional-match',
        hash: this.generateHash(patient),
        requiresAttestation: true
      };
    }

    // Unconditional match (inactive or user has token)
    return {
      type: 'unconditional-match',
      patient: patient,
      requiresAttestation: false
    };
  }

  /**
   * Grant temporary access via attestation (Break Glass)
   */
  grantAccessViaAttestation(patientId: string, userId: string, reason: string): void {
    this.patientAccessTokens.set(patientId, true);
    // This will be logged in the audit service
  }

  /**
   * Check if user has access to view patient
   */
  hasAccessToken(patientId: string): boolean {
    return this.patientAccessTokens.get(patientId) ?? false;
  }

  /**
   * Revoke access token
   */
  revokeAccessToken(patientId: string): void {
    this.patientAccessTokens.delete(patientId);
  }

  /**
   * Create new patient with auto-generated registry ID
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'registryId' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const patient: Patient = {
      ...patientData,
      id: this.generateUUID(),
      registryId: this.generateRegistryId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.offlineStorage.put('patients', patient);
    return patient;
  }

  /**
   * Get patient (with privacy check)
   */
  async getPatient(patientId: string, userId?: string): Promise<Patient | undefined> {
    const patient = await this.offlineStorage.get<Patient>('patients', patientId);

    if (!patient) {
      return undefined;
    }

    // Privacy check: if patient is active elsewhere and no token, don't return
    if (
      patient.currentEnrollment?.status === 'active' &&
      !this.hasAccessToken(patientId)
    ) {
      throw new Error('Access denied: Attestation required');
    }

    return patient;
  }

  /**
   * Update patient
   */
  async updatePatient(patient: Patient): Promise<Patient> {
    patient.updatedAt = new Date().toISOString();
    await this.offlineStorage.put('patients', patient);
    return patient;
  }

  /**
   * Get all patients (filtered by facility for clinic users)
   */
  async getPatientsByFacility(facilityId: string): Promise<Patient[]> {
    const allPatients = await this.offlineStorage.getAll<Patient>('patients');
    return allPatients.filter(
      (p) => p.currentEnrollment?.facilityId === facilityId && p.currentEnrollment?.status === 'active'
    );
  }

  /**
   * Set current patient context
   */
  setCurrentPatient(patient: Patient | null): void {
    this.currentPatientSubject.next(patient);
  }

  /**
   * Admit patient to facility
   */
  async admitPatient(
    patientId: string,
    facilityId: string,
    facilityName: string,
    moudType: string
  ): Promise<Patient> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    patient.currentEnrollment = {
      facilityId,
      facilityName,
      moudType,
      enrollmentDate: new Date().toISOString(),
      status: 'active'
    };

    return this.updatePatient(patient);
  }

  /**
   * Transfer patient to different facility
   */
  async transferPatient(
    patientId: string,
    newFacilityId: string,
    newFacilityName: string
  ): Promise<Patient> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    if (patient.currentEnrollment) {
      patient.currentEnrollment.facilityId = newFacilityId;
      patient.currentEnrollment.facilityName = newFacilityName;
    }

    return this.updatePatient(patient);
  }

  /**
   * Terminate patient enrollment
   */
  async terminatePatient(
    patientId: string,
    reason: string,
    finalDosage?: string
  ): Promise<Patient> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    if (patient.currentEnrollment) {
      patient.currentEnrollment.status = 'terminated';
    }

    return this.updatePatient(patient);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private generateRegistryId(): string {
    // Permanent, unique, random ID
    return 'RX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateHash(patient: Patient): string {
    // Generate a simple hash for conditional match (no identifying info)
    const data = `${patient.firstName}${patient.lastName}${patient.dateOfBirth}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'MATCH-' + Math.abs(hash).toString(16);
  }
}
