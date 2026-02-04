import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { FacilityService, Facility } from '../../../core/services/facility.service';
import { AuditService } from '../../../core/services/audit.service';
import { SyncService } from '../../../core/services/sync.service';

type EnrollmentStep = 'demographics' | 'duplicate-check' | 'clinical' | 'consents';

@Component({
  selector: 'app-admit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="enrollment-layout">
      <!-- Main Content -->
      <main class="enrollment-main">
        <div class="enrollment-container">
          <!-- Page Header -->
          <div class="enrollment-header">
            <div class="header-title-section">
              <h2 class="enrollment-title">New Patient Enrollment</h2>
              <p class="enrollment-subtitle">Complete the following steps to enroll a new patient into the OTP registry.</p>
            </div>
            
            <!-- Step Indicator -->
            <div class="step-indicator">
              <div [class.step-item]="true" [class.active]="currentStep === 'demographics'" [class.completed]="isStepCompleted('demographics')">
                <div class="step-number">1</div>
                <span class="step-label">Demographics</span>
              </div>
              <div class="step-divider"></div>
              <div [class.step-item]="true" [class.active]="currentStep === 'clinical'" [class.completed]="isStepCompleted('clinical')">
                <div class="step-number">2</div>
                <span class="step-label">Clinical</span>
              </div>
              <div class="step-divider"></div>
              <div [class.step-item]="true" [class.active]="currentStep === 'consents'" [class.completed]="isStepCompleted('consents')">
                <div class="step-number">3</div>
                <span class="step-label">Consents</span>
              </div>
            </div>
          </div>

          <!-- Demographics Step -->
          <div *ngIf="currentStep === 'demographics'" class="enrollment-card">
            <div class="card-header">
              <div class="header-icon">
                <i class="bi bi-person"></i>
              </div>
              <div class="header-content">
                <h3 class="card-title">Patient Demographics</h3>
                <p class="card-description">Enter the patient's personal identification details.</p>
              </div>
            </div>

            <div class="card-content">
              <form [formGroup]="demographicsForm" (ngSubmit)="nextStep('demographics')">
                <!-- Name Fields -->
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label">First Name <span class="required">*</span></label>
                    <input 
                      type="text" 
                      formControlName="firstName"
                      class="form-input"
                      placeholder="Jane"
                    />
                    <span *ngIf="demographicsForm.get('firstName')?.invalid && demographicsForm.get('firstName')?.touched" class="error-text">
                      First name is required
                    </span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Middle</label>
                    <input 
                      type="text" 
                      formControlName="middleInitial"
                      class="form-input"
                      placeholder="M"
                      maxlength="1"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Last Name <span class="required">*</span></label>
                    <input 
                      type="text" 
                      formControlName="lastName"
                      class="form-input"
                      placeholder="Doe"
                    />
                    <span *ngIf="demographicsForm.get('lastName')?.invalid && demographicsForm.get('lastName')?.touched" class="error-text">
                      Last name is required
                    </span>
                  </div>
                </div>

                <!-- Alias and Gender -->
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">A.K.A. / Alias</label>
                    <input 
                      type="text" 
                      formControlName="alias"
                      class="form-input"
                      placeholder="Also known as..."
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Gender Identity</label>
                    <div class="radio-group">
                      <div class="radio-item">
                        <input type="radio" id="male" value="Male" formControlName="gender" />
                        <label for="male">Male</label>
                      </div>
                      <div class="radio-item">
                        <input type="radio" id="female" value="Female" formControlName="gender" />
                        <label for="female">Female</label>
                      </div>
                      <div class="radio-item">
                        <input type="radio" id="other" value="Other" formControlName="gender" />
                        <label for="other">Other</label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DOB, SSN, Medicaid -->
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label">Date of Birth <span class="required">*</span></label>
                    <input 
                      type="date" 
                      formControlName="dateOfBirth"
                      class="form-input"
                    />
                    <span *ngIf="demographicsForm.get('dateOfBirth')?.invalid && demographicsForm.get('dateOfBirth')?.touched" class="error-text">
                      Date of birth is required
                    </span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Social Security Number <span class="required">*</span></label>
                    <input 
                      type="text" 
                      formControlName="ssn"
                      class="form-input"
                      placeholder="123-45-6789"
                      maxlength="11"
                    />
                    <span *ngIf="demographicsForm.get('ssn')?.invalid && demographicsForm.get('ssn')?.touched" class="error-text">
                      Valid SSN format required (XXX-XX-XXXX)
                    </span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Medicaid Number</label>
                    <input 
                      type="text" 
                      formControlName="medicaidNumber"
                      class="form-input"
                      placeholder="1234567890"
                      maxlength="10"
                    />
                  </div>
                </div>

                <!-- Mother's Name and Contact -->
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Mother's First Name</label>
                    <input 
                      type="text" 
                      formControlName="motherFirstName"
                      class="form-input"
                      placeholder="Mother's first name"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <div class="input-icon-left">
                      <i class="bi bi-telephone"></i>
                      <input 
                        type="tel" 
                        formControlName="phoneNumber"
                        class="form-input"
                        placeholder="(907) 555-0000"
                      />
                    </div>
                  </div>
                </div>

                <!-- Address -->
                <div class="form-group">
                  <label class="form-label">Residential Address</label>
                  <div class="input-icon-left">
                    <i class="bi bi-geo-alt"></i>
                    <input 
                      type="text" 
                      formControlName="address"
                      class="form-input"
                      placeholder="123 Main St, Anchorage, AK 99501"
                    />
                  </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="!demographicsForm.valid">
                    Next: Clinical
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Duplicate Check Step -->
          <div *ngIf="currentStep === 'duplicate-check'" class="enrollment-card duplicate-check-card">
            <div class="card-header amber-header">
              <div class="header-icon warning-icon">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="header-content">
                <h3 class="card-title">Possible Duplicate Patients Found</h3>
                <p class="card-description">We found 1 existing patient record(s) that match the details you entered. Please verify if the patient is already enrolled before creating a new record.</p>
              </div>
            </div>

            <div class="card-content duplicate-content">
              <!-- Possible Match Card -->
              <div class="match-card">
                <div class="match-header">
                  <span class="badge badge-possible-match">Possible Match</span>
                  <span class="match-reason">Reason: SSN Last 4 Match</span>
                  <span class="badge badge-restricted">
                    <i class="bi bi-lock"></i>
                    Restricted
                  </span>
                </div>

                <div class="match-body">
                  <div class="patient-avatar">
                    <i class="bi bi-person"></i>
                  </div>
                  <div class="patient-info">
                    <h4>Restricted Patient Record</h4>
                    <p class="text-small">Identity protected under 42 CFR Part 2</p>
                  </div>
                </div>

                <div class="match-note">
                  <p>This patient is enrolled at another facility. To view details or coordinate care, you must verify identity and attest to having a valid release of information.</p>
                </div>

                <button type="button" class="btn btn-break-glass" (click)="requestBreakGlassAccess()">
                  <i class="bi bi-shield-check"></i>
                  Request "Break Glass" Access
                </button>
              </div>

              <!-- Info Box -->
              <div class="info-box blue-info">
                <div class="info-icon">
                  <i class="bi bi-eye"></i>
                </div>
                <p>If you are certain this is a different person (e.g., same name but different person), you may proceed. Otherwise, cancel this enrollment and manage the existing patient record.</p>
              </div>
            </div>

            <div class="card-footer">
              <button type="button" class="btn btn-secondary" (click)="backToEdit()">
                Back to Edit
              </button>
              <div class="action-buttons">
                <button type="button" class="btn btn-cancel" (click)="cancelEnrollment()">
                  <i class="bi bi-x"></i>
                  Cancel Enrollment
                </button>
                <button type="button" class="btn btn-primary" (click)="proceedAsNewPatient()">
                  It's a Different Person, Proceed
                </button>
              </div>
            </div>
          </div>

          <!-- Clinical Step -->
          <div *ngIf="currentStep === 'clinical'" class="enrollment-card">
            <div class="card-header">
              <div class="header-icon">
                <i class="bi bi-pill"></i>
              </div>
              <div class="header-content">
                <h3 class="card-title">Clinical Enrollment</h3>
                <p class="card-description">Establish initial medication plan and dosing.</p>
              </div>
            </div>

            <div class="card-content">
              <form [formGroup]="clinicalForm" (ngSubmit)="nextStep('clinical')">
                <!-- Enrollment Date and Medication -->
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Enrollment Date <span class="required">*</span></label>
                    <div class="input-icon-left">
                      <i class="bi bi-calendar"></i>
                      <input 
                        type="date" 
                        formControlName="enrollmentDate"
                        class="form-input"
                      />
                    </div>
                    <span *ngIf="clinicalForm.get('enrollmentDate')?.invalid && clinicalForm.get('enrollmentDate')?.touched" class="error-text">
                      Enrollment date is required
                    </span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Medication <span class="required">*</span></label>
                    <select formControlName="medication" class="form-input">
                      <option value="">Select medication</option>
                      <option value="Methadone">Methadone</option>
                      <option value="Buprenorphine">Buprenorphine</option>
                      <option value="Naltrexone">Naltrexone</option>
                      <option value="Suboxone">Suboxone</option>
                      <option value="Subutex">Subutex</option>
                      <option value="Vivitrol">Vivitrol</option>
                    </select>
                    <span *ngIf="clinicalForm.get('medication')?.invalid && clinicalForm.get('medication')?.touched" class="error-text">
                      Medication is required
                    </span>
                  </div>
                </div>

                <!-- Initial Dose and Frequency -->
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Initial Dose (mg) <span class="required">*</span></label>
                    <input 
                      type="number" 
                      formControlName="initialDose"
                      class="form-input"
                      placeholder="30"
                    />
                    <span *ngIf="clinicalForm.get('initialDose')?.invalid && clinicalForm.get('initialDose')?.touched" class="error-text">
                      Initial dose is required
                    </span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Frequency <span class="required">*</span></label>
                    <select formControlName="frequency" class="form-input">
                      <option value="">Select frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="3-Times-Weekly">3 Times Weekly</option>
                      <option value="Twice-Weekly">Twice Weekly</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                    <span *ngIf="clinicalForm.get('frequency')?.invalid && clinicalForm.get('frequency')?.touched" class="error-text">
                      Frequency is required
                    </span>
                  </div>
                </div>

                <!-- Take-Home Authorization -->
                <div class="form-group">
                  <label class="form-label">Take-Home Authorization</label>
                  <div class="checkbox-card">
                    <div class="checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        id="takeHome"
                        formControlName="takeHomeAuthorized"
                        class="form-checkbox"
                      />
                      <div class="checkbox-content">
                        <label for="takeHome" class="checkbox-title">Patient Authorized for Take-Home Doses</label>
                        <p class="checkbox-description">Overall authorization status. Individual doses may vary based on clinical assessment.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                  <button type="button" class="btn btn-secondary" (click)="previousStep()">
                    Back
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="!clinicalForm.valid">
                    Next: Consents
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Consents Step -->
          <div *ngIf="currentStep === 'consents'" class="enrollment-card">
            <div class="card-header">
              <div class="header-icon">
                <i class="bi bi-file-pen-line"></i>
              </div>
              <div class="header-content">
                <h3 class="card-title">Privacy and Consents</h3>
                <p class="card-description">Required legal consents for data sharing and treatment.</p>
              </div>
            </div>

            <div class="card-content">
              <form [formGroup]="consentsForm" (ngSubmit)="submitEnrollment()">
                <div class="consents-section">
                  <!-- SOTA Consent -->
                  <div class="consent-checkbox-card sota-required">
                    <div class="consent-header-wrapper">
                      <input 
                        type="checkbox" 
                        id="sota"
                        formControlName="sotaConsent"
                        class="form-checkbox"
                      />
                      <div class="consent-header">
                        <label for="sota" class="consent-title">SOTA Data Sharing Consent</label>
                        <span class="badge badge-required">Required</span>
                      </div>
                    </div>
                    <p class="consent-description">I attest that the patient has consented to share their admission and treatment data with the <strong>State Opioid Treatment Authority (SOTA)</strong> and a signed release is on file.</p>
                  </div>

                  <!-- PDMP Consent -->
                  <div class="consent-checkbox-card pdmp-optional">
                    <div class="consent-header-wrapper">
                      <input 
                        type="checkbox" 
                        id="pdmp"
                        formControlName="pdmpConsent"
                        class="form-checkbox"
                      />
                      <div class="consent-header">
                        <label for="pdmp" class="consent-title">PDMP Reporting Consent</label>
                        <span class="badge badge-optional">Optional</span>
                      </div>
                    </div>
                    <p class="consent-description">I attest that the patient has consented to share their dispensing data with the state <strong>Prescription Drug Monitoring Program (PDMP)</strong> and a signed release is on file.</p>
                    <p class="consent-helper">Leave unchecked if patient has declined PDMP consent.</p>
                  </div>
                </div>

                <!-- Attestation Box -->
                <div class="attestation-box">
                  <div class="attestation-icon">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <p class="attestation-text"><strong>By submitting this enrollment,</strong> you attest that you have verified the patient's identity, reviewed all enrollment criteria, and confirmed that all required consents are signed and filed in accordance with state and federal regulations.</p>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                  <button type="button" class="btn btn-secondary" (click)="previousStep()">
                    Back
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="!consentsForm.valid || isSubmitting">
                    {{ isSubmitting ? 'Completing Enrollment...' : 'Complete Enrollment' }}
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
        </div>
      </main>

      <!-- Help Button -->
      <button class="help-button" title="Help and Support">
        <i class="bi bi-life-buoy"></i>
        <span class="sr-only">Help and Support</span>
      </button>
    </div>
  `,
  styles: [`
    .enrollment-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .enrollment-main {
      flex: 1;
      overflow-y: auto;
      background-color: #f8f9fa;
    }

    .enrollment-container {
      padding: 2rem;
      width: 100%;
      max-width: 48rem;
      margin: 0 auto;
    }

    .enrollment-header {
      margin-bottom: 2rem;
    }

    .header-title-section {
      margin-bottom: 1.5rem;
    }

    .enrollment-title {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .enrollment-subtitle {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #d1d5db;

      .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 9999px;
        border: 1px solid #d1d5db;
        font-size: 0.75rem;
      }

      .step-label {
        display: none;
      }

      &.active {
        color: #0c5caa;

        .step-number {
          background-color: #0c5caa;
          color: white;
          border-color: #0c5caa;
        }
      }

      &.completed {
        color: #0c5caa;

        .step-number {
          background-color: #0c5caa;
          color: white;
          border-color: #0c5caa;

          &::after {
            content: '✓';
            font-weight: bold;
          }
        }
      }

      @media (min-width: 640px) {
        .step-label {
          display: inline;
        }
      }
    }

    .step-divider {
      width: 2rem;
      height: 1px;
      background-color: #d1d5db;
    }

    .enrollment-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .duplicate-check-card {
      border-top: 4px solid #f59e0b;
    }

    .duplicate-content {
      padding: 1.5rem;
    }

    .amber-header {
      background-color: #fef3c7;
      border-bottom: 1px solid #fcd34d;
    }

    .warning-icon {
      color: #b45309;

      i {
        color: inherit;
      }
    }

    .card-header {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      color: #6b7280;

      i {
        font-size: 1.25rem;
      }
    }

    .header-content {
      display: grid;
      gap: 0.25rem;
    }

    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .card-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .card-content {
      padding: 1.5rem;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .form-group {
      display: grid;
      gap: 0.5rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.25rem;

      .required {
        color: #dc2626;
      }
    }

    .form-input {
      display: flex;
      height: 2.25rem;
      width: 100%;
      min-width: 0;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      background-color: #f9fafb;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      background-color: #fafbfc;
      transition: all 0.2s;
      outline: 2px solid transparent;
      outline-offset: 2px;

      &:hover {
        border-color: #9ca3af;
      }

      &:focus {
        outline: 2px solid #0c5caa;
        outline-offset: 2px;
        border-color: #0c5caa;
        background-color: white;
      }

      &:disabled {
        background-color: #f3f4f6;
        color: #9ca3af;
        cursor: not-allowed;
      }

      &[type="date"] {
        padding: 0.5rem;
      }
    }

    .input-icon-left {
      position: relative;
      display: flex;
      align-items: center;

      i {
        position: absolute;
        left: 0.75rem;
        color: #9ca3af;
        pointer-events: none;
      }

      input {
        padding-left: 2.5rem;
      }
    }

    .radio-group {
      display: flex;
      gap: 1rem;
      align-items: center;
      height: 2.5rem;
    }

    .radio-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input[type="radio"] {
        width: 1rem;
        height: 1rem;
        cursor: pointer;
      }

      label {
        margin: 0;
        cursor: pointer;
        font-size: 0.875rem;
      }
    }

    .checkbox-card {
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      padding: 1rem;
      background-color: #f9fafb;

      &:hover {
        background-color: #f3f4f6;
      }
    }

    .checkbox-wrapper {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .form-checkbox {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .checkbox-content {
      display: grid;
      gap: 0.25rem;
      flex: 1;
    }

    .checkbox-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: #1f2937;
      margin: 0;
    }

    .checkbox-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .consents-section {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .consent-checkbox-card {
      border-radius: 0.375rem;
      border: 2px solid #d1d5db;
      padding: 1.25rem;
      display: grid;
      gap: 0.75rem;

      &.sota-required {
        background-color: #fef3c7;
        border-color: #fcd34d;
      }

      &.pdmp-optional {
        background-color: white;
        border-color: #d1d5db;
      }
    }

    .consent-header-wrapper {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .consent-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .consent-title {
      font-weight: 600;
      font-size: 1rem;
      color: #1f2937;
      margin: 0;
      cursor: pointer;
      line-height: 1.5;
    }

    .badge {
      display: inline-block;
      border-radius: 0.25rem;
      border: 1px solid;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;

      &.badge-required {
        background-color: #fee2e2;
        border-color: #fca5a5;
        color: #991b1b;
      }

      &.badge-optional {
        background-color: white;
        border-color: #d1d5db;
        color: #1f2937;
      }
    }

    .consent-description {
      font-size: 0.875rem;
      color: #1f2937;
      margin: 0;
      line-height: 1.5;

      strong {
        font-weight: 600;
      }
    }

    .consent-helper {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0;
      font-style: italic;
    }

    .attestation-box {
      border-radius: 0.5rem;
      border: 2px solid #bfdbfe;
      background-color: #eff6ff;
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .attestation-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      color: #1d4ed8;
      flex-shrink: 0;
      margin-top: 0.125rem;

      i {
        font-size: 1.25rem;
      }
    }

    .attestation-text {
      font-size: 0.875rem;
      color: #1e3a8a;
      margin: 0;
      line-height: 1.5;

      strong {
        font-weight: 600;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      justify-content: space-between;

      @media (max-width: 640px) {
        flex-direction: column-reverse;
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      white-space: nowrap;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.btn-primary {
        background-color: #0c5caa;
        color: white;

        &:hover:not(:disabled) {
          background-color: #0a4a85;
          transform: translateY(-2px);
        }
      }

      &.btn-secondary {
        background-color: white;
        color: #1f2937;
        border: 1px solid #d1d5db;

        &:hover:not(:disabled) {
          background-color: #f3f4f6;
        }
      }

      @media (max-width: 640px) {
        width: 100%;
      }
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #dcfce7;
      border: 1px solid #86efac;
      border-radius: 0.375rem;
      color: #166534;
      margin-top: 1rem;

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 0.375rem;
      color: #991b1b;
      margin-top: 1rem;

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
      }
    }

    .error-text {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .help-button {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      background-color: #0c5caa;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      z-index: 50;

      i {
        font-size: 1.5rem;
      }

      &:hover {
        background-color: #0a4a85;
        transform: scale(1.1);
      }
    }

    .match-card {
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      overflow: hidden;
      background: white;
    }

    .match-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: #f3f4f6;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .badge-possible-match {
      background-color: #dbeafe;
      color: #1e40af;
      border-color: #93c5fd;
    }

    .badge-restricted {
      background-color: #fef3c7;
      color: #a16207;
      border-color: #fcd34d;
      display: flex;
      align-items: center;
      gap: 0.25rem;

      i {
        font-size: 0.75rem;
      }
    }

    .match-reason {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .match-body {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .patient-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      background-color: #f3f4f6;
      flex-shrink: 0;
      color: #9ca3af;

      i {
        font-size: 1.25rem;
      }
    }

    .patient-info {
      flex: 1;

      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .text-small {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .match-note {
      padding: 0.75rem 1rem;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #4b5563;
        line-height: 1.5;
      }
    }

    .btn-break-glass {
      width: 100%;
      padding: 0.75rem;
      background-color: white;
      border: 1px solid #fcd34d;
      color: #a16207;
      border-radius: 0.375rem;
      margin: 1rem;
      margin-top: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;

      i {
        font-size: 1rem;
      }

      &:hover {
        background-color: #fef3c7;
      }
    }

    .info-box {
      border-radius: 0.5rem;
      padding: 0.75rem;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;

      p {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .blue-info {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e3a8a;
    }

    .info-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.125rem;
      color: inherit;

      i {
        font-size: 1rem;
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex: 1;

      @media (max-width: 640px) {
        flex-direction: column;
        width: 100%;
      }
    }

    .btn-cancel {
      background-color: white;
      border: 1px solid #fca5a5;
      color: #991b1b;

      &:hover:not(:disabled) {
        background-color: #fee2e2;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    @media (max-width: 768px) {
      .enrollment-layout {
        grid-template-columns: 1fr;
      }

      .enrollment-container {
        padding: 1rem;
      }

      .enrollment-title {
        font-size: 1.5rem;
      }

      .step-label {
        display: none !important;
      }
    }
  `]
})
export class AdmitComponent implements OnInit {
  currentStep: EnrollmentStep = 'demographics';
  demographicsForm!: FormGroup;
  clinicalForm!: FormGroup;
  consentsForm!: FormGroup;

  facilities: Facility[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  duplicateFound = false;
  breakGlassRequested = false;

  private completedSteps = new Set<EnrollmentStep>();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private facilityService: FacilityService,
    private auditService: AuditService,
    private syncService: SyncService,
    private router: Router
  ) {
    this.initializeForms();
  }

  async ngOnInit(): Promise<void> {
    this.facilities = await this.facilityService.getAllFacilities();
  }

  private initializeForms(): void {
    this.demographicsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleInitial: [''],
      alias: [''],
      gender: ['Male'],
      dateOfBirth: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
      medicaidNumber: [''],
      motherFirstName: [''],
      phoneNumber: [''],
      address: ['']
    });

    this.clinicalForm = this.fb.group({
      enrollmentDate: [new Date().toISOString().split('T')[0], Validators.required],
      medication: ['', Validators.required],
      initialDose: ['', Validators.required],
      frequency: ['', Validators.required],
      takeHomeAuthorized: [false]
    });

    this.consentsForm = this.fb.group({
      sotaConsent: [false, Validators.requiredTrue],
      pdmpConsent: [false]
    });
  }

  isStepCompleted(step: EnrollmentStep): boolean {
    return this.completedSteps.has(step);
  }

  async nextStep(step: EnrollmentStep): Promise<void> {
    if (step === 'demographics' && this.demographicsForm.valid) {
      // Check for duplicate patients
      await this.checkForDuplicates();
    } else if (step === 'clinical' && this.clinicalForm.valid) {
      this.completedSteps.add('clinical');
      this.currentStep = 'consents';
    }
  }

  private async checkForDuplicates(): Promise<void> {
    const demographics = this.demographicsForm.value;

    try {
      const result = await this.patientService.searchPatient(
        demographics.firstName,
        demographics.lastName,
        demographics.dateOfBirth,
        demographics.ssn,
        demographics.motherFirstName
      );

      if (result.type === 'conditional-match' && result.requiresAttestation) {
        // Duplicate found - show restricted patient screen
        this.duplicateFound = true;
        this.currentStep = 'duplicate-check';
      } else {
        // No conflict - proceed to clinical
        this.completedSteps.add('demographics');
        this.currentStep = 'clinical';
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Proceed anyway on error
      this.completedSteps.add('demographics');
      this.currentStep = 'clinical';
    }
  }

  previousStep(): void {
    if (this.currentStep === 'clinical') {
      this.currentStep = 'demographics';
    } else if (this.currentStep === 'consents') {
      this.currentStep = 'clinical';
    }
  }

  backToEdit(): void {
    this.currentStep = 'demographics';
    this.duplicateFound = false;
    this.breakGlassRequested = false;
  }

  cancelEnrollment(): void {
    if (confirm('Are you sure you want to cancel this enrollment?')) {
      this.router.navigate(['/']);
    }
  }

  proceedAsNewPatient(): void {
    // Grant attestation and proceed to clinical step
    const demographics = this.demographicsForm.value;
    // In a real scenario, this would grant a break glass access token
    // For now, we just grant attestation locally
    this.patientService.grantAccessViaAttestation(
      'temp-' + demographics.ssn,
      'current-user',
      'Different person attestation during enrollment'
    );

    this.completedSteps.add('demographics');
    this.duplicateFound = false;
    this.currentStep = 'clinical';
  }

  requestBreakGlassAccess(): void {
    // In a real system, this would create a break glass access request
    this.breakGlassRequested = true;
    this.successMessage = 'Break Glass access request submitted. An administrator will review your request shortly.';
  }

  async submitEnrollment(): Promise<void> {
    if (!this.consentsForm.valid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const demographics = this.demographicsForm.value;
      const clinical = this.clinicalForm.value;
      const consents = this.consentsForm.value;

      const patient = await this.patientService.createPatient({
        firstName: demographics.firstName,
        lastName: demographics.lastName,
        dateOfBirth: demographics.dateOfBirth,
        ssn: demographics.ssn,
        motherFirstName: demographics.motherFirstName,
        pdmpConsent: consents.pdmpConsent,
        currentEnrollment: {
          facilityId: 'default',
          facilityName: 'Anchorage Comprehensive Treatment Center',
          moudType: clinical.medication,
          enrollmentDate: clinical.enrollmentDate,
          status: 'active'
        }
      });

      if (clinical.initialDose) {
        await this.syncService.queueForSync('dosage', {
          patientId: patient.id,
          dosageAmount: clinical.initialDose,
          moudType: clinical.medication,
          frequency: clinical.frequency,
          timestamp: new Date().toISOString(),
          source: 'admission'
        });
      }

      await this.auditService.logAction('admit', 'success', {
        patientId: patient.id,
        details: {
          moudType: clinical.medication,
          sotaConsent: consents.sotaConsent,
          pdmpConsent: consents.pdmpConsent
        }
      });

      this.successMessage = `Patient ${patient.firstName} ${patient.lastName} enrolled successfully. Registry ID: ${patient.registryId}`;

      setTimeout(() => {
        this.router.navigate(['/patient', patient.id]);
      }, 2000);
    } catch (error) {
      console.error('Enrollment failed:', error);
      this.errorMessage = (error as Error).message || 'Failed to complete enrollment';
      await this.auditService.logAction('admit', 'failed', {
        reason: this.errorMessage
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/patient']);
  }
}
