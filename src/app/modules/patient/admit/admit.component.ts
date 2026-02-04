import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { FacilityService, Facility } from '../../../core/services/facility.service';
import { AuditService } from '../../../core/services/audit.service';
import { SyncService } from '../../../core/services/sync.service';

@Component({
  selector: 'app-admit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admit-container">
      <div class="admit-card">
        <h1>Admit New Patient</h1>
        <p class="subtitle">Enter patient information to add them to the registry</p>

        <form [formGroup]="admitForm" (ngSubmit)="onSubmit()">
          <!-- Step 1: Patient Demographics -->
          <section class="form-section">
            <h2>Patient Demographics</h2>
            
            <div class="form-group">
              <label>First Name *</label>
              <input 
                type="text" 
                formControlName="firstName"
                class="form-control"
                placeholder="Enter first name"
              />
              <span *ngIf="admitForm.get('firstName')?.hasError('required')" class="error">
                First name is required
              </span>
            </div>

            <div class="form-group">
              <label>Last Name *</label>
              <input 
                type="text" 
                formControlName="lastName"
                class="form-control"
                placeholder="Enter last name"
              />
              <span *ngIf="admitForm.get('lastName')?.hasError('required')" class="error">
                Last name is required
              </span>
            </div>

            <div class="form-group">
              <label>Date of Birth *</label>
              <input 
                type="date" 
                formControlName="dateOfBirth"
                class="form-control"
              />
              <span *ngIf="admitForm.get('dateOfBirth')?.hasError('required')" class="error">
                Date of birth is required
              </span>
            </div>

            <div class="form-group">
              <label>Social Security Number (Last 4) *</label>
              <input 
                type="text" 
                formControlName="ssn"
                class="form-control"
                placeholder="1234"
                maxlength="4"
              />
              <span *ngIf="admitForm.get('ssn')?.hasError('required')" class="error">
                SSN is required
              </span>
            </div>

            <div class="form-group">
              <label>Mother's First Name (Optional)</label>
              <input 
                type="text" 
                formControlName="motherFirstName"
                class="form-control"
                placeholder="For verification purposes"
              />
            </div>
          </section>

          <!-- Step 2: Enrollment Details -->
          <section class="form-section">
            <h2>Enrollment Details</h2>
            
            <div class="form-group">
              <label>Facility *</label>
              <select formControlName="facilityId" class="form-control">
                <option value="">Select a facility</option>
                <option *ngFor="let facility of facilities" [value]="facility.id">
                  {{ facility.name }} - {{ facility.city }}
                </option>
              </select>
              <span *ngIf="admitForm.get('facilityId')?.hasError('required')" class="error">
                Facility is required
              </span>
            </div>

            <div class="form-group">
              <label>Medication Type (MOUD) *</label>
              <select formControlName="moudType" class="form-control">
                <option value="">Select medication type</option>
                <option value="Methadone">Methadone</option>
                <option value="Buprenorphine">Buprenorphine</option>
                <option value="Naltrexone">Naltrexone</option>
                <option value="Suboxone">Suboxone</option>
                <option value="Subutex">Subutex</option>
                <option value="Vivitrol">Vivitrol</option>
              </select>
              <span *ngIf="admitForm.get('moudType')?.hasError('required')" class="error">
                Medication type is required
              </span>
            </div>

            <div class="form-group">
              <label>Initial Dosage (mg)</label>
              <input 
                type="number" 
                formControlName="initialDosage"
                class="form-control"
                placeholder="e.g., 30"
              />
            </div>

            <div class="form-group">
              <label>Dosing Frequency *</label>
              <select formControlName="dosingFrequency" class="form-control">
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="3-times-weekly">3 Times Weekly</option>
                <option value="twice-weekly">Twice Weekly</option>
                <option value="weekly">Weekly</option>
              </select>
              <span *ngIf="admitForm.get('dosingFrequency')?.hasError('required')" class="error">
                Dosing frequency is required
              </span>
            </div>
          </section>

          <!-- Step 3: Consent & Compliance -->
          <section class="form-section">
            <h2>Consent & Compliance</h2>
            
            <div class="form-group checkbox">
              <input 
                type="checkbox" 
                formControlName="pdmpConsent"
                id="pdmpConsent"
              />
              <label for="pdmpConsent">
                Patient consents to PDMP disclosure
              </label>
              <p class="help-text">
                Patient authorizes information sharing with Alaska Prescription Monitoring Program
              </p>
            </div>

            <div class="form-group checkbox">
              <input 
                type="checkbox" 
                formControlName="acceptTerms"
                id="acceptTerms"
              />
              <label for="acceptTerms">
                I confirm this patient information is accurate *
              </label>
              <span *ngIf="admitForm.get('acceptTerms')?.hasError('required')" class="error">
                You must confirm the information is accurate
              </span>
            </div>
          </section>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!admitForm.valid || isSubmitting"
            >
              <i *ngIf="!isSubmitting" class="bi bi-check-circle"></i>
              <i *ngIf="isSubmitting" class="bi bi-hourglass-split"></i>
              {{ isSubmitting ? 'Admitting...' : 'Admit Patient' }}
            </button>
          </div>

          <div *ngIf="successMessage" class="success-message">
            <i class="bi bi-check-circle"></i>
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="bi bi-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admit-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    .admit-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .subtitle {
        margin: 0 0 2rem 0;
        color: #666;
      }
    }

    .form-section {
      margin-bottom: 2.5rem;

      h2 {
        margin: 0 0 1.5rem 0;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
        color: #333;
        font-size: 1.1rem;
      }

      &:last-of-type {
        margin-bottom: 2rem;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      &.checkbox {
        label {
          display: flex;
          align-items: center;
          font-weight: normal;
          margin: 0;
        }

        input[type="checkbox"] {
          margin-right: 0.75rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: #0c5caa;
        box-shadow: 0 0 0 3px rgba(12, 92, 170, 0.1);
      }

      &:disabled {
        background: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
      }
    }

    .help-text {
      margin: 0.5rem 0 0 0;
      font-size: 0.85rem;
      color: #666;
    }

    .error {
      display: block;
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.btn-primary {
        background: #0c5caa;
        color: white;

        &:hover:not(:disabled) {
          background: #0a4a85;
          transform: translateY(-2px);
        }
      }

      &.btn-secondary {
        background: #6c757d;
        color: white;

        &:hover {
          background: #5a6268;
        }
      }

      i {
        font-size: 1.1rem;
      }
    }

    .success-message {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
      color: #155724;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        font-size: 1.2rem;
      }
    }

    .error-message {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
      color: #721c24;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      i {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 600px) {
      .admit-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AdmitComponent implements OnInit {
  admitForm!: FormGroup;
  facilities: Facility[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private facilityService: FacilityService,
    private auditService: AuditService,
    private syncService: SyncService,
    private router: Router
  ) {
    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    this.facilities = await this.facilityService.getAllFacilities();
  }

  private initializeForm(): void {
    this.admitForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      motherFirstName: [''],
      facilityId: ['', Validators.required],
      moudType: ['', Validators.required],
      initialDosage: [''],
      dosingFrequency: ['', Validators.required],
      pdmpConsent: [false],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.admitForm.valid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValue = this.admitForm.value;
      const facility = this.facilities.find((f) => f.id === formValue.facilityId);

      // Create new patient
      const patient = await this.patientService.createPatient({
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        dateOfBirth: formValue.dateOfBirth,
        ssn: formValue.ssn,
        motherFirstName: formValue.motherFirstName,
        pdmpConsent: formValue.pdmpConsent,
        currentEnrollment: {
          facilityId: formValue.facilityId,
          facilityName: facility?.name || '',
          moudType: formValue.moudType,
          enrollmentDate: new Date().toISOString(),
          status: 'active'
        }
      });

      // Queue initial dosage if provided
      if (formValue.initialDosage) {
        await this.syncService.queueForSync('dosage', {
          patientId: patient.id,
          dosageAmount: formValue.initialDosage,
          moudType: formValue.moudType,
          frequency: formValue.dosingFrequency,
          timestamp: new Date().toISOString(),
          source: 'admission'
        });
      }

      // Log admission in audit trail
      await this.auditService.logAction('admit', 'success', {
        patientId: patient.id,
        details: {
          facilityId: formValue.facilityId,
          moudType: formValue.moudType
        }
      });

      this.successMessage = `Patient ${patient.firstName} ${patient.lastName} admitted successfully. Registry ID: ${patient.registryId}`;

      // Reset form
      setTimeout(() => {
        this.router.navigate(['/patient', patient.id]);
      }, 2000);
    } catch (error) {
      console.error('Admission failed:', error);
      this.errorMessage = (error as Error).message || 'Failed to admit patient';
      await this.auditService.logAction('admit', 'failed', {
        reason: this.errorMessage
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/patient']);
  }
}
