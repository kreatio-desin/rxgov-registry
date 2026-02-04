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

  constructor(private offlineStorage: OfflineStorageService) {
    this.initializeSamplePatients();
  }

  private async initializeSamplePatients(): Promise<void> {
    // Initialize with sample data if no patients exist
    await this.offlineStorage.ensureDbReady();
    const existingPatients = await this.offlineStorage.getAll<Patient>('patients');

    // Check if we need to reload - if SSN is in old format (just last 4 digits)
    const needsReload = existingPatients.length > 0 &&
      existingPatients[0].ssn &&
      existingPatients[0].ssn.length <= 4; // Old format was just '1234'

    if (existingPatients.length === 0 || needsReload) {
      if (needsReload) {
        await this.offlineStorage.clear('patients');
      }
      const samplePatients: Patient[] = [
        {
          id: 'patient-001',
          registryId: 'RX-2233445566',
          firstName: 'Maverick',
          lastName: 'Nelson',
          dateOfBirth: '1988-12-06',
          ssn: '123-45-1234',
          motherFirstName: 'Evelyn',
          demographics: {
            gender: 'Male',
            race: 'White',
            ethnicity: 'Non-Hispanic',
            address: '987 Birch Ln',
            city: 'Anchorage',
            state: 'AK',
            zip: '99501',
            phone: '(907) 555-0105'
          },
          currentEnrollment: {
            facilityId: 'fac-cms-001',
            facilityName: 'Community Medical Services – Wasilla',
            moudType: 'Methadone',
            enrollmentDate: '2024-05-12',
            status: 'active'
          },
          pdmpConsent: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'patient-002',
          registryId: 'RX-1122334455',
          firstName: 'James',
          lastName: 'Smith',
          dateOfBirth: '1990-03-15',
          ssn: '456-78-5678',
          motherFirstName: 'Patricia',
          demographics: {
            gender: 'Male',
            race: 'White',
            ethnicity: 'Non-Hispanic',
            address: '456 Oak Ave',
            city: 'Anchorage',
            state: 'AK',
            zip: '99502',
            phone: '(907) 555-0234'
          },
          currentEnrollment: {
            facilityId: 'fac-searhc-001',
            facilityName: 'SEARHC – Ketchikan',
            moudType: 'Methadone',
            enrollmentDate: '2024-08-20',
            status: 'active'
          },
          pdmpConsent: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'patient-003',
          registryId: 'RX-9988776655',
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: '1985-07-22',
          ssn: '901-23-9012',
          motherFirstName: 'Margaret',
          demographics: {
            gender: 'Female',
            race: 'Black',
            ethnicity: 'Non-Hispanic',
            address: '789 Pine St',
            city: 'Anchorage',
            state: 'AK',
            zip: '99503',
            phone: '(907) 555-0345'
          },
          currentEnrollment: {
            facilityId: 'fac-searhc-002',
            facilityName: 'SEARHC – Juneau',
            moudType: 'Buprenorphine',
            enrollmentDate: '2024-02-10',
            status: 'active'
          },
          pdmpConsent: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const patient of samplePatients) {
        await this.offlineStorage.put('patients', patient);
      }
    }
    // Sample patients are at OTHER facilities, so no access tokens are granted by default
    // Access tokens should only be granted when:
    // 1. User provides attestation during enrollment of duplicate patient
    // 2. User requests and is approved for break glass access
    // 3. User's clinic has the patient enrolled
  }

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
    // Get all patients to search
    const allPatients = await this.offlineStorage.getAll<Patient>('patients');

    // Search for matches by SSN first (primary identifier), then by name + DOB
    let exactMatches: Patient[] = [];

    if (ssn) {
      // Search by SSN first - this is the primary duplicate identifier
      exactMatches = allPatients.filter(
        (p) => p.ssn === ssn
      );
    }

    // If no SSN match, search by name + DOB
    if (exactMatches.length === 0) {
      exactMatches = allPatients.filter(
        (p) =>
          p.firstName.toLowerCase() === firstName.toLowerCase() &&
          p.lastName.toLowerCase() === lastName.toLowerCase() &&
          p.dateOfBirth === dateOfBirth
      );
    }

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
