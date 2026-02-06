import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { TransferService } from '../../core/services/transfer.service';
import { FacilityService, Facility } from '../../core/services/facility.service';
import { AuthService, AuthUser } from '../../core/services/auth.service';

interface DoseRecord {
  dateTime: string;
  type: 'Observed' | 'Take-Home';
  medication: string;
  formulation: string;
  quantity: string;
  source: string;
  administeredBy: string;
}

interface AdministerDoseForm {
  dateTime: string;
  observedDose: {
    medication: string;
    doseAmount: string;
  };
  takeHomeDoses: {
    numberOfDoses: string;
    doseAmount: string;
  };
  counselingServices: {
    individual: boolean;
    group: boolean;
  };
  clinicalNotes: string;
}

interface TransferForm {
  transferDate: string;
  destinationClinic: string;
  transferNotes: string;
  consentAttest: boolean;
}

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="patient-record-container">
      <!-- Break Glass Warning Alert -->
      <div *ngIf="hasBreakGlassAccess" class="break-glass-alert">
        <div class="alert-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m12 16 4-4"></path>
            <path d="m12 8 4 4"></path>
            <path d="M12 8 8 12"></path>
            <path d="M12 16 8 12"></path>
          </svg>
          <div class="alert-text">
            <span class="alert-title">Emergency Guest Access Active</span>
            <span class="alert-message">You are viewing a patient from another facility. This session is being audited and you have access to this patient's details for 24 hours only.</span>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="patient-header">
        <div class="header-top">
          <button class="back-btn" (click)="goBack()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back to List
          </button>
        </div>

        <div class="header-content">
          <div class="patient-info">
            <h2 class="patient-name">
              {{ patient?.lastName }}, {{ patient?.firstName }}
              <span class="nickname" *ngIf="patientNickname">"{{ patientNickname }}"</span>
            </h2>
            <div class="patient-meta">
              <span class="rx-id">{{ patient?.registryId }}</span>
              <span class="meta-sep">•</span>
              <span>DOB: {{ patient?.dateOfBirth | date: 'MMM d, yyyy' }}</span>
              <span class="meta-sep">•</span>
              <div class="ssn-wrapper">
                <span>SSN: •••-••-{{ patient?.ssn }}</span>
                <button class="reveal-ssn" title="Reveal SSN (logs to audit)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <span class="meta-sep">•</span>
              <div class="facility-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 12h4"></path>
                  <path d="M10 8h4"></path>
                  <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                  <path
                    d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"
                  ></path>
                  <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
                </svg>
                <span>{{ patient?.currentEnrollment?.facilityName }}</span>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button class="administer-dose-btn" (click)="openAdministerDoseModal()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m18 2 4 4"></path>
                <path d="m17 7 3-3"></path>
                <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"></path>
                <path d="m9 11 4 4"></path>
                <path d="m5 19-3 3"></path>
                <path d="m14 4 6 6"></path>
              </svg>
              {{ hasBreakGlassAccess ? 'Emergency Guest Dose' : 'Administer Dose' }}
            </button>
            <button class="transfer-to-facility-btn" *ngIf="hasBreakGlassAccess" (click)="openBreakGlassTransferModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m14 7 5 5-5 5"></path>
                <path d="M3.5 14H19"></path>
                <path d="m10 17-7-7 7-7"></path>
              </svg>
              Transfer to This Facility
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-grid">
        <!-- Left Column - Dosing History -->
        <div class="dosing-history-section">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M12 7v5l4 2"></path>
                </svg>
                Recent Dosing History
              </h3>
            </div>
            <div class="card-content">
              <!-- Desktop Table -->
              <div class="table-wrapper hidden-mobile">
                <table class="dosing-table">
                  <thead>
                    <tr>
                      <th>Date and Time</th>
                      <th>Type</th>
                      <th>Medication</th>
                      <th>Formulation</th>
                      <th>Quantity</th>
                      <th>Source</th>
                      <th>Administered By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let dose of dosingHistory">
                      <td class="font-medium">{{ dose.dateTime }}</td>
                      <td>
                        <span class="badge badge-observed">{{ dose.type }}</span>
                      </td>
                      <td>{{ dose.medication }}</td>
                      <td>{{ dose.formulation }}</td>
                      <td>{{ dose.quantity }}</td>
                      <td>
                        <span class="source-badge">{{ dose.source }}</span>
                      </td>
                      <td class="text-sm">{{ dose.administeredBy }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Cards -->
              <div class="visible-mobile space-y-3 p-4">
                <div *ngFor="let dose of dosingHistory" class="dose-card">
                  <div class="dose-header">
                    <div class="dose-time">{{ dose.dateTime }}</div>
                    <span class="badge badge-observed">{{ dose.type }}</span>
                  </div>
                  <div class="dose-grid">
                    <div class="dose-item">
                      <div class="dose-label">Medication</div>
                      <div>{{ dose.medication }}</div>
                    </div>
                    <div class="dose-item">
                      <div class="dose-label">Formulation</div>
                      <div>{{ dose.formulation }}</div>
                    </div>
                    <div class="dose-item">
                      <div class="dose-label">Quantity</div>
                      <div>{{ dose.quantity }}</div>
                    </div>
                    <div class="dose-item">
                      <div class="dose-label">Source</div>
                      <span class="source-badge">{{ dose.source }}</span>
                    </div>
                    <div class="dose-item">
                      <div class="dose-label">By</div>
                      <div class="text-sm truncate">{{ dose.administeredBy }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Patient Status -->
        <div class="patient-status-section">
          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Patient Status</h3>
              <button class="edit-btn" title="Edit Details">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                  ></path>
                  <path d="m15 5 4 4"></path>
                </svg>
              </button>
            </div>
            <div class="card-content">
              <div class="status-grid">
                <div class="status-item">
                  <span class="status-label">Status:</span>
                  <span class="font-medium">{{
                    patient?.currentEnrollment?.status | titlecase
                  }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Home Clinic:</span>
                  <span
                    class="font-medium truncate"
                    [title]="patient?.currentEnrollment?.facilityName"
                    >{{ patient?.currentEnrollment?.facilityName }}</span
                  >
                </div>
                <div class="status-item">
                  <span class="status-label">Medicaid ID:</span>
                  <span class="font-medium">N/A</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Gender:</span>
                  <span class="font-medium">{{ patient?.demographics?.gender || 'Male' }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Phone:</span>
                  <span class="font-medium">{{
                    patient?.demographics?.phone || '(907) 555-0105'
                  }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Enrollment:</span>
                  <span class="font-medium">{{
                    patient?.currentEnrollment?.enrollmentDate | date: 'MM/dd/yyyy'
                  }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Mother's Name:</span>
                  <span class="font-medium">{{ patient?.motherFirstName || 'Evelyn' }}</span>
                </div>
              </div>

              <div class="separator"></div>

              <div class="address-section">
                <div class="address-label">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                    ></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Residential Address:
                </div>
                <div class="address-text">
                  {{ patient?.demographics?.address || '987 Birch Ln, Anchorage, AK' }}
                </div>
              </div>

              <div class="separator"></div>

              <!-- Active Prescriptions -->
              <div class="prescriptions-section">
                <div class="prescriptions-header">
                  <h4>Active Prescriptions</h4>
                  <button class="change-btn">Change</button>
                </div>
                <div class="prescription-card">
                  <div class="prescription-name">Methadone 60mg</div>
                  <div class="prescription-frequency">Daily • Oral Solution</div>
                  <div class="prescription-warning">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m15 9-6 6"></path>
                      <path d="m9 9 6 6"></path>
                    </svg>
                    <span>Take Home Not Recommended</span>
                  </div>
                </div>
              </div>

              <!-- Consents -->
              <div class="consents-section">
                <div class="consents-header">
                  <h4>Consents</h4>
                </div>
                <div class="consent-list">
                  <div class="consent-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <div class="consent-info">
                      <span class="consent-name">SOTA Data Sharing</span>
                      <span class="consent-date">5/12/2024</span>
                    </div>
                  </div>
                  <div class="consent-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <div class="consent-info">
                      <span class="consent-name">PDMP Reporting</span>
                      <span class="consent-date">5/12/2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Clinical Management -->
          <div class="card" *ngIf="currentUser && (currentUser.role === 'facility-manager' || currentUser.role === 'facility-staff')">
            <div class="card-header">
              <h3 class="card-title">Clinical Management</h3>
            </div>
            <div class="card-content">
              <div class="management-actions">
                <button class="management-btn transfer-btn" (click)="openTransferModal()">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m14 7 5 5-5 5"></path>
                    <path d="M3.5 14H19"></path>
                    <path d="m10 17-7-7 7-7"></path>
                  </svg>
                  Transfer
                </button>
                <button class="management-btn inactive-btn" *ngIf="currentUser && currentUser.role === 'facility-manager'" (click)="openInactiveModal()">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <path d="M12 1v6"></path>
                    <path d="M12 17v6"></path>
                    <path d="M4.22 4.22l4.24 4.24"></path>
                    <path d="M15.54 15.54l4.24 4.24"></path>
                    <path d="M1 12h6"></path>
                    <path d="M17 12h6"></path>
                    <path d="M4.22 19.78l4.24-4.24"></path>
                    <path d="M15.54 8.46l4.24-4.24"></path>
                  </svg>
                  Inactive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Administer Dose Modal -->
      <div
        *ngIf="showAdministerDoseModal"
        class="modal-overlay"
        (click)="closeAdministerDoseModal()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeAdministerDoseModal()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Administer Dose</h2>
            <p>Record a new dose for {{ patient?.lastName }}, {{ patient?.firstName }}.</p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Date and Time -->
            <div class="form-group">
              <label class="form-label">Date and Time</label>
              <input
                type="datetime-local"
                class="form-input"
                [(ngModel)]="administerDoseForm.dateTime"
                [value]="currentDateTime"
              />
            </div>

            <!-- Observed Dose Section -->
            <div class="form-section observed-section">
              <div class="section-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 1v6"></path>
                  <path d="M15 1v6"></path>
                  <rect x="3" y="7" width="18" height="14" rx="2"></rect>
                  <path d="M3 11h18"></path>
                </svg>
                Observed Dose
              </div>
              <div class="form-grid">
                <div>
                  <label class="form-label">Medication</label>
                  <select
                    class="form-input"
                    [(ngModel)]="administerDoseForm.observedDose.medication"
                  >
                    <option value="Methadone">Methadone</option>
                    <option value="Buprenorphine">Buprenorphine</option>
                    <option value="Naltrexone">Naltrexone</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Dose Amount (mg)</label>
                  <input
                    type="number"
                    class="form-input"
                    placeholder="0"
                    [(ngModel)]="administerDoseForm.observedDose.doseAmount"
                  />
                </div>
              </div>
            </div>

            <!-- Take-Home Doses Section -->
            <div class="form-section takehome-section">
              <div class="section-header takehome-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Take-Home Doses
              </div>
              <p class="takehome-desc">Additional doses dispensed for at-home administration</p>
              <div class="warning-box">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
                <span>Take-Home Not Recommended</span>
              </div>
              <p class="warning-text">
                Patient record indicates take-home doses are not currently permitted.
              </p>
              <div class="form-grid">
                <div>
                  <label class="form-label">Number of Doses</label>
                  <input
                    type="number"
                    class="form-input"
                    placeholder="0"
                    [(ngModel)]="administerDoseForm.takeHomeDoses.numberOfDoses"
                    disabled
                  />
                </div>
                <div>
                  <label class="form-label">Dose Amount (mg)</label>
                  <input
                    type="number"
                    class="form-input"
                    placeholder="0"
                    [(ngModel)]="administerDoseForm.takeHomeDoses.doseAmount"
                    disabled
                  />
                </div>
              </div>
            </div>

            <!-- Counseling Services Section -->
            <div class="form-section counseling-section">
              <div class="section-header counseling-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Counseling Services
              </div>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    class="checkbox-input"
                    [(ngModel)]="administerDoseForm.counselingServices.individual"
                  />
                  <span>Individual Counseling</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    class="checkbox-input"
                    [(ngModel)]="administerDoseForm.counselingServices.group"
                  />
                  <span>Group Counseling</span>
                </label>
              </div>
            </div>

            <!-- Clinical Notes -->
            <div class="form-group">
              <label class="form-label">Clinical Notes (Optional)</label>
              <textarea
                class="form-input textarea"
                placeholder="Enter any observation notes..."
                [(ngModel)]="administerDoseForm.clinicalNotes"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeAdministerDoseModal()">Cancel</button>
            <button class="btn-record" (click)="recordDose()">Record Dose</button>
          </div>
        </div>
      </div>

      <!-- Transfer Patient Modal -->
      <div *ngIf="showTransferModal" class="modal-overlay" (click)="closeTransferModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeTransferModal()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Transfer Patient</h2>
            <p>
              Initiate a transfer for {{ patient?.lastName }}, {{ patient?.firstName }} to another
              OTP.
            </p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Transfer Date -->
            <div class="form-group">
              <label class="form-label">Transfer Date (Administrative)</label>
              <input
                type="date"
                class="form-input"
                [(ngModel)]="transferForm.transferDate"
                [value]="currentTransferDate"
              />
              <p class="form-hint">Date of administrative transfer</p>
            </div>

            <!-- Destination Clinic -->
            <div class="form-group">
              <label class="form-label">Destination Clinic</label>
              <select class="form-input" [(ngModel)]="transferForm.destinationClinic">
                <option value="">Select facility...</option>
                <option *ngFor="let facility of availableFacilities" [value]="facility.id">
                  {{ facility.name }}
                </option>
              </select>
            </div>

            <!-- Transfer Notes -->
            <div class="form-group">
              <label class="form-label">Transfer Notes *</label>
              <textarea
                class="form-input textarea"
                placeholder="Clinical summary, current medication regimen, last dose details, special considerations..."
                [(ngModel)]="transferForm.transferNotes"
              ></textarea>
              <p class="form-hint">
                Required: These notes will be visible to the receiving provider for clinical review.
              </p>
            </div>

            <!-- Consent Checkbox -->
            <div class="consent-box">
              <label class="consent-checkbox">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  [(ngModel)]="transferForm.consentAttest"
                />
                <span
                  >I attest that the patient has consented to the sharing of their treatment records
                  with the receiving facility for the purpose of care coordination.</span
                >
              </label>
            </div>

            <!-- Warning Message -->
            <div class="info-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
              <span
                >Patient will be hidden from staff until accepted by the receiving facility's OTP
                Manager.</span
              >
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeTransferModal()">Cancel</button>
            <button
              class="btn-confirm"
              (click)="confirmTransfer()"
              [disabled]="!transferForm.consentAttest || !transferForm.destinationClinic"
            >
              Confirm Transfer
            </button>
          </div>
        </div>
      </div>

      <!-- Break Glass Transfer Modal -->
      <div *ngIf="showBreakGlassTransferModal" class="modal-overlay" (click)="closeBreakGlassTransferModal()">
        <div class="modal-content break-glass-modal" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeBreakGlassTransferModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span class="sr-only">Close</span>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="title-icon">
                <path d="M10 12h4"></path>
                <path d="M10 8h4"></path>
                <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
              </svg>
              Transfer Patient to Your Clinic
            </h2>
            <p class="modal-description">Transfer {{ patient?.lastName }}, {{ patient?.firstName }} from {{ patient?.currentEnrollment?.facilityName }} to {{ currentUser?.facilityName }}.</p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body break-glass-body">
            <!-- Patient Consent Alert -->
            <div class="consent-alert">
              <p class="consent-title">Patient Consent Required</p>
              <p class="consent-message">This action requires documented patient consent for transfer of care. Ensure you have obtained verbal or written consent before proceeding.</p>
            </div>

            <!-- Transfer Reason -->
            <div class="form-group">
              <label for="transfer-notes" class="form-label">Transfer Reason (Optional)</label>
              <textarea
                id="transfer-notes"
                class="form-textarea"
                [(ngModel)]="breakGlassTransferForm.transferReason"
                placeholder="E.g., Patient relocated to Anchorage, closer to home, patient request..."
                rows="3"
              ></textarea>
            </div>

            <!-- Consent Checkbox -->
            <div class="checkbox-container">
              <input
                type="checkbox"
                id="transfer-consent"
                [(ngModel)]="breakGlassTransferForm.consentAttest"
                class="form-checkbox"
              />
              <label for="transfer-consent" class="checkbox-label">
                I confirm that patient consent has been obtained and documented for this transfer of care.
              </label>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeBreakGlassTransferModal()">Cancel</button>
            <button
              class="btn-primary"
              (click)="confirmBreakGlassTransfer()"
              [disabled]="!breakGlassTransferForm.consentAttest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
                <path d="M10 12h4"></path>
                <path d="M10 8h4"></path>
                <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
              </svg>
              Complete Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .patient-record-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: #f5f5f5;
        animation: fadeIn 0.2s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Header Styles */
      .patient-header {
        padding: 1.5rem;
        background: var(--color-bg-primary);
        border-bottom: 1px solid var(--color-border);
      }

      .header-top {
        margin-bottom: 1.5rem;
      }

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: transparent;
        border: none;
        color: #2563eb;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0.5rem;
        margin-left: -0.5rem;
        transition: color 0.2s;
      }

      .back-btn:hover {
        color: #1d4ed8;
      }

      .back-btn svg {
        width: 1rem;
        height: 1rem;
      }

      .header-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
      }

      @media (min-width: 640px) {
        .header-content {
          flex-direction: row;
        }
      }

      .patient-info {
        flex: 1;
      }

      .patient-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
      }

      .nickname {
        color: #9ca3af;
        font-weight: 400;
      }

      .patient-meta {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: #6b7280;
      }

      @media (min-width: 640px) {
        .patient-meta {
          flex-direction: row;
          align-items: center;
          gap: 0;
        }
      }

      .rx-id {
        font-family: monospace;
        font-weight: 600;
        color: #2563eb;
      }

      .meta-sep {
        display: none;
      }

      @media (min-width: 640px) {
        .meta-sep {
          display: inline;
        }
      }

      .ssn-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .reveal-ssn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.125rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        border-radius: 0.25rem;
      }

      .reveal-ssn:hover {
        background: var(--color-bg-tertiary);
      }

      .reveal-ssn svg {
        width: 0.875rem;
        height: 0.875rem;
        color: #9ca3af;
      }

      .facility-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .facility-info svg {
        width: 0.75rem;
        height: 0.75rem;
      }

      .administer-dose-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        background: var(--color-button-bg);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .administer-dose-btn:hover {
        background: var(--color-button-hover);
      }

      .administer-dose-btn svg {
        width: 1rem;
        height: 1rem;
      }

      /* Content Grid */
      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
        flex: 1;
      }

      @media (max-width: 1024px) {
        .content-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Card Styles */
      .card {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .card-header {
        padding: 1rem;
        background: var(--color-bg-tertiary);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .card-header.flex-between {
        justify-content: space-between;
      }

      .card-title {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .card-title svg {
        width: 1rem;
        height: 1rem;
        color: #6b7280;
      }

      .edit-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.375rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        border-radius: 0.25rem;
      }

      .edit-btn:hover {
        background: #e5e7eb;
      }

      .edit-btn svg {
        width: 0.875rem;
        height: 0.875rem;
        color: #6b7280;
      }

      .card-content {
        flex: 1;
        overflow-y: auto;
      }

      /* Dosing History Styles */
      .dosing-history-section {
        display: flex;
        flex-direction: column;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .dosing-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }

      .dosing-table thead {
        background: var(--color-bg-tertiary);
      }

      .dosing-table th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--color-border);
      }

      .dosing-table td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-primary);
      }

      .dosing-table tbody tr:hover {
        background: var(--color-bg-tertiary);
      }

      .dosing-table tbody tr:last-child td {
        border-bottom: none;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .badge-observed {
        background: #dbeafe;
        color: #1e40af;
      }

      .source-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        background: var(--color-bg-tertiary);
        color: #6b7280;
      }

      .font-medium {
        font-weight: 500;
      }

      .text-sm {
        font-size: 0.875rem;
      }

      .visible-mobile {
        display: none;
      }

      .hidden-mobile {
        display: block;
      }

      @media (max-width: 768px) {
        .visible-mobile {
          display: block;
        }

        .hidden-mobile {
          display: none;
        }

        .dose-card {
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          background: var(--color-bg-tertiary);
        }

        .dose-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .dose-time {
          font-weight: 600;
          color: #1f2937;
        }

        .dose-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .dose-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .dose-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
      }

      /* Patient Status Styles */
      .patient-status-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem 0.75rem;
        padding: 1rem;
        font-size: 0.875rem;
      }

      .status-item {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .status-label {
        color: #6b7280;
        font-size: 0.75rem;
      }

      .separator {
        height: 1px;
        background: #e5e7eb;
        margin: 0.75rem 0;
      }

      .address-section {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .address-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .address-label svg {
        width: 0.875rem;
        height: 0.875rem;
        color: #6b7280;
      }

      .address-text {
        font-size: 0.875rem;
        color: #6b7280;
        word-break: break-word;
      }

      .prescriptions-section {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .prescriptions-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .prescriptions-header h4 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }

      .change-btn {
        background: transparent;
        border: none;
        color: #2563eb;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        transition: color 0.2s;
      }

      .change-btn:hover {
        color: #1d4ed8;
      }

      .prescription-card {
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        background: var(--color-bg-tertiary);
      }

      .prescription-name {
        font-weight: 500;
        color: #1f2937;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .prescription-frequency {
        font-size: 0.75rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
      }

      .prescription-warning {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--color-bg-primary);
        border: 1px solid #fecaca;
        border-radius: 0.375rem;
      }

      .prescription-warning svg {
        width: 0.875rem;
        height: 0.875rem;
        color: #dc2626;
        flex-shrink: 0;
      }

      .prescription-warning span {
        font-size: 0.75rem;
        color: #dc2626;
      }

      .consents-section {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .consents-header h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }

      .consent-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .consent-item {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .consent-item svg {
        width: 1rem;
        height: 1rem;
        color: #16a34a;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .consent-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .consent-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }

      .consent-date {
        font-size: 0.75rem;
        color: #6b7280;
        margin-left: 1.5rem;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-content {
        background: var(--color-bg-primary);
        border-radius: 0.5rem;
        padding: 1.5rem;
        max-width: 512px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 10px 38px rgba(0, 0, 0, 0.1);
        animation: modalSlideIn 0.2s ease-out;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .modal-close:hover {
        color: #1f2937;
      }

      .modal-close svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      .modal-header {
        margin-bottom: 1.5rem;
      }

      .modal-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }

      .modal-header p {
        margin: 0;
        font-size: 0.75rem;
        color: #6b7280;
      }

      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }

      .form-input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-family: inherit;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }

      .form-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .form-input:disabled {
        background: var(--color-bg-tertiary);
        color: #9ca3af;
        cursor: not-allowed;
      }

      .form-input.textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .form-section {
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        padding: 0.75rem;
      }

      .observed-section {
        border-color: #bfdbfe;
        background: #eff6ff;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1f2937;
        font-size: 0.875rem;
      }

      .section-header svg {
        width: 1rem;
        height: 1rem;
        color: #1e40af;
      }

      .takehome-section {
        border-color: #bbf7d0;
        background: #f0fdf4;
      }

      .takehome-header svg {
        color: #059669;
      }

      .takehome-desc {
        margin: 0.5rem 0;
        font-size: 0.75rem;
        color: #6b7280;
      }

      .warning-box {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 0.375rem;
        margin-bottom: 0.75rem;
      }

      .warning-box svg {
        width: 1.25rem;
        height: 1.25rem;
        color: #b45309;
        flex-shrink: 0;
      }

      .warning-box span {
        font-weight: 500;
        color: #78350f;
        font-size: 0.875rem;
      }

      .warning-text {
        margin: 0;
        font-size: 0.75rem;
        color: #92400e;
        margin-bottom: 0.75rem;
      }

      .counseling-section {
        border-color: #e9d5ff;
        background: #faf5ff;
      }

      .counseling-header svg {
        color: #7c3aed;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        color: #1f2937;
      }

      .checkbox-input {
        width: 1rem;
        height: 1rem;
        cursor: pointer;
        accent-color: #7c3aed;
      }

      .modal-footer {
        display: flex;
        flex-direction: column-reverse;
        gap: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e5e7eb;
      }

      @media (min-width: 640px) {
        .modal-footer {
          flex-direction: row;
          justify-content: flex-end;
        }
      }

      .btn-cancel,
      .btn-record {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-cancel {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
      }

      .btn-cancel:hover {
        background: var(--color-bg-tertiary);
        border-color: var(--color-text-tertiary);
      }

      .btn-record {
        background: var(--color-button-bg);
        color: white;
      }

      .btn-record:hover {
        background: var(--color-button-hover);
      }

      @media (max-width: 640px) {
        .modal-content {
          max-width: 100%;
        }

        .btn-cancel,
        .btn-record {
          width: 100%;
        }
      }

      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .space-y-3 > * + * {
        margin-top: 0.75rem;
      }

      /* Clinical Management Styles */
      .management-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
      }

      .management-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
      }

      .management-btn:hover {
        background: var(--color-bg-tertiary);
        border-color: var(--color-text-secondary);
      }

      .management-btn svg {
        width: 1rem;
        height: 1rem;
      }

      .transfer-btn {
        border-color: #93c5fd;
        color: #1e40af;
      }

      .transfer-btn:hover {
        background: #eff6ff;
        border-color: #3b82f6;
      }

      .inactive-btn {
        border-color: #fecaca;
        color: #991b1b;
      }

      .inactive-btn:hover {
        background: #fef2f2;
        border-color: #ef4444;
      }

      /* Transfer Modal Styles */
      .form-hint {
        margin: 0;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        margin-top: 0.25rem;
      }

      .consent-box {
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        background: var(--color-bg-tertiary);
      }

      .consent-checkbox {
        display: flex;
        gap: 0.75rem;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        line-height: 1.5;
      }

      .consent-checkbox input {
        margin-top: 0.125rem;
        flex-shrink: 0;
      }

      .info-box {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.75rem 1rem;
        background: #dbeafe;
        border: 1px solid #bfdbfe;
        border-radius: 0.375rem;
        border-left: 4px solid #3b82f6;
      }

      .info-box svg {
        flex-shrink: 0;
        color: #1d4ed8;
        margin-top: 0.125rem;
      }

      .info-box span {
        font-size: 0.875rem;
        color: #1e40af;
      }

      .btn-confirm {
        background: var(--color-button-bg);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-confirm:hover:not(:disabled) {
        background: var(--color-button-hover);
      }

      .btn-confirm:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Break Glass Alert Styles */
      .break-glass-alert {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        padding: 1rem 1.5rem;
        margin: 0;
        border-bottom: 2px solid #991b1b;
      }

      .alert-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: white;
        max-width: 100%;
      }

      .alert-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        color: white;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .alert-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .alert-title {
        font-weight: 600;
        font-size: 0.95rem;
        display: block;
      }

      .alert-message {
        font-size: 0.85rem;
        opacity: 0.95;
        display: block;
      }

      .transfer-action-btn {
        flex-shrink: 0;
        background: white;
        color: #dc2626;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .transfer-action-btn:hover {
        background: #f3f4f6;
        transform: translateY(-1px);
      }

      .transfer-action-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Alert Styles for Modal */
      .alert {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      .alert-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 0.125rem;
      }

      .alert.alert-info {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
      }

      .alert.alert-info .alert-icon {
        color: #3b82f6;
      }

      .alert strong {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .alert p {
        margin: 0;
        opacity: 0.9;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }

      .form-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--color-bg-tertiary);
        border-radius: 0.375rem;
        margin-bottom: 1rem;
      }

      .form-checkbox {
        flex-shrink: 0;
        margin-top: 0.25rem;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .checkbox-label {
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--color-text-primary);
        cursor: pointer;
      }
    `,
  ],
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  patientNickname = '"Mav"';
  showAdministerDoseModal = false;
  showTransferModal = false;
  showBreakGlassTransferModal = false;
  currentDateTime: string = '';
  currentTransferDate: string = '';
  currentUser: AuthUser | null = null;
  hasBreakGlassAccess = false;
  breakGlassAccessTime: Date | null = null;

  transferForm: TransferForm = {
    transferDate: '',
    destinationClinic: '',
    transferNotes: '',
    consentAttest: false,
  };

  breakGlassTransferForm = {
    transferReason: '',
    consentAttest: false,
  };

  availableFacilities: Facility[] = [];

  dosingHistory: DoseRecord[] = [
    {
      dateTime: 'Feb 4, 1:33 PM',
      type: 'Observed',
      medication: 'Methadone',
      formulation: 'N/A',
      quantity: '60mg',
      source: 'Anchorage CTC - Methasoft',
      administeredBy: 'Sarah Martinez, RN',
    },
    {
      dateTime: 'Feb 2, 6:38 PM',
      type: 'Observed',
      medication: 'Methadone',
      formulation: 'Liquid Concentrate',
      quantity: '60mg',
      source: 'MMU Manual Add',
      administeredBy: 'Dr. Smith',
    },
  ];

  administerDoseForm: AdministerDoseForm = {
    dateTime: '',
    observedDose: {
      medication: 'Methadone',
      doseAmount: '',
    },
    takeHomeDoses: {
      numberOfDoses: '0',
      doseAmount: '0',
    },
    counselingServices: {
      individual: false,
      group: false,
    },
    clinicalNotes: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private transferService: TransferService,
    private facilityService: FacilityService,
    private authService: AuthService,
  ) {
    // Initialize datetime to current time
    const now = new Date();
    this.currentDateTime = now.toISOString().slice(0, 16);
    this.administerDoseForm.dateTime = this.currentDateTime;
  }

  async ngOnInit(): Promise<void> {
    // Load current user
    this.currentUser = this.authService.getCurrentUser();

    // Load facilities for transfer dropdown
    try {
      this.availableFacilities = await this.facilityService.getAllFacilities();
    } catch (error) {
      console.error('Failed to load facilities:', error);
      this.availableFacilities = [];
    }

    // Load patient data
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      try {
        const result = await this.patientService.getPatient(patientId);
        this.patient = result || null;

        // Check if this is a break glass access scenario
        this.checkBreakGlassStatus(patientId);
      } catch (error) {
        console.error('Failed to load patient:', error);
        this.patient = null;
      }
    }
  }

  private checkBreakGlassStatus(patientId: string): void {
    // Check if user has break glass access to this patient
    if (this.patientService.hasAccessToken(patientId)) {
      this.hasBreakGlassAccess = true;
      this.breakGlassAccessTime = new Date();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  openAdministerDoseModal(): void {
    const now = new Date();
    this.currentDateTime = now.toISOString().slice(0, 16);
    this.administerDoseForm.dateTime = this.currentDateTime;
    this.showAdministerDoseModal = true;
  }

  closeAdministerDoseModal(): void {
    this.showAdministerDoseModal = false;
  }

  recordDose(): void {
    // Add the dose to history
    const date = new Date(this.administerDoseForm.dateTime);
    const dateTimeString = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const newDose: DoseRecord = {
      dateTime: dateTimeString,
      type: 'Observed',
      medication: this.administerDoseForm.observedDose.medication,
      formulation: 'N/A',
      quantity: `${this.administerDoseForm.observedDose.doseAmount}mg`,
      source: this.patient?.currentEnrollment?.facilityName || 'Unknown',
      administeredBy: 'Current User',
    };

    this.dosingHistory.unshift(newDose);
    this.closeAdministerDoseModal();
  }

  openTransferModal(): void {
    // Initialize transfer date to today
    const today = new Date();
    this.currentTransferDate = today.toISOString().split('T')[0];
    this.transferForm = {
      transferDate: this.currentTransferDate,
      destinationClinic: '',
      transferNotes: '',
      consentAttest: false,
    };
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.transferForm = {
      transferDate: '',
      destinationClinic: '',
      transferNotes: '',
      consentAttest: false,
    };
  }

  async confirmTransfer(): Promise<void> {
    if (!this.transferForm.consentAttest || !this.transferForm.destinationClinic) {
      alert('Please complete all required fields and attest to patient consent.');
      return;
    }

    // Find the destination facility name
    const destinationFacility = this.availableFacilities.find(
      (f) => f.id === this.transferForm.destinationClinic,
    );

    try {
      await this.transferService.initiateTransfer({
        patientId: this.patient?.registryId || '',
        patientName: `${this.patient?.firstName} ${this.patient?.lastName}`,
        sourceClinic: this.patient?.currentEnrollment?.facilityName || '',
        destinationClinic: destinationFacility?.name || '',
        destinationFacilityId: this.transferForm.destinationClinic,
        transferDate: this.transferForm.transferDate,
        transferNotes: this.transferForm.transferNotes,
        status: 'pending',
      });

      alert(
        `Transfer initiated for ${this.patient?.lastName}, ${this.patient?.firstName} to ${destinationFacility?.name}. The patient will be hidden from staff until the transfer is accepted.`,
      );
      this.closeTransferModal();
    } catch (error) {
      console.error('Error initiating transfer:', error);
      alert('Failed to initiate transfer. Please try again.');
    }
  }

  openInactiveModal(): void {
    // Placeholder for inactive functionality
    alert('Mark patient as Inactive functionality coming soon.');
  }

  openBreakGlassTransferModal(): void {
    this.breakGlassTransferForm = {
      transferReason: '',
      consentAttest: false,
    };
    this.showBreakGlassTransferModal = true;
  }

  closeBreakGlassTransferModal(): void {
    this.showBreakGlassTransferModal = false;
  }

  async confirmBreakGlassTransfer(): Promise<void> {
    if (!this.breakGlassTransferForm.consentAttest) {
      alert('Please confirm patient consent before proceeding with the transfer.');
      return;
    }

    try {
      // Get current user's facility (destination)
      const currentUserFacility = await this.facilityService.getFacility(this.currentUser?.facilityId || '');

      await this.transferService.initiateTransfer({
        patientId: this.patient?.registryId || '',
        patientName: `${this.patient?.firstName} ${this.patient?.lastName}`,
        sourceClinic: this.patient?.currentEnrollment?.facilityName || '',
        destinationClinic: currentUserFacility?.name || this.currentUser?.facilityName || '',
        destinationFacilityId: this.currentUser?.facilityId || '',
        transferDate: new Date().toISOString().split('T')[0],
        transferNotes: this.breakGlassTransferForm.transferReason || 'Emergency guest access transfer',
        status: 'pending',
      });

      alert(
        `Transfer initiated for ${this.patient?.lastName}, ${this.patient?.firstName}. The patient will be added to the transfer queue and the facility manager will review the request.`,
      );
      this.closeBreakGlassTransferModal();
    } catch (error) {
      console.error('Error initiating transfer:', error);
      alert('Failed to initiate transfer. Please try again.');
    }
  }
}
