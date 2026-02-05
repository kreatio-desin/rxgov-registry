import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';

interface Report {
  id: string;
  name: string;
  description: string;
  rowLevel: string;
  rowLevelBg: string;
}

interface PatientCensusRecord {
  enrollmentId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  medicaidId: string;
  gender: string;
  age: number;
  dob: string;
  county: string;
  homeFacility: string;
  facilityId: string;
  activePrescription: string;
  prescriptionDose: string;
  lastDoseDate: string;
  administeredBy: string;
  enrollmentDate: string;
  currentPhase: string;
}

interface BreakGlassAccess {
  patientId: string;
  patientName: string;
  requestingFacilityId: string;
  patientFacilityId: string;
  attestationConfirmed: boolean;
}

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button
              *ngIf="selectedReport"
              class="btn-back"
              (click)="backToReportsList()"
              title="Back to reports"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
            <div>
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="header-icon">
                  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                  <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                  <path d="M10 9H8"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                </svg>
                {{ selectedReport ? selectedReport.name : 'Standard Reports' }}
              </h2>
              <p>{{ selectedReport ? selectedReport.description : 'Export standard operational and compliance reports.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports List View -->
      <div *ngIf="!selectedReport" class="reports-card">
        <!-- Card Header -->
        <div class="card-header">
          <div class="header-title">
            <h4>Available Reports</h4>
            <p>Select a report to view details and export data.</p>
          </div>
          
          <div class="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle>
            </svg>
            <input 
              type="search" 
              placeholder="Search reports..." 
              [(ngModel)]="searchQuery"
              (input)="filterReports()"
              class="search-input"
            >
          </div>
        </div>

        <!-- Table Content -->
        <div class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th class="col-name">Report Name</th>
                <th class="col-level">Row Level</th>
                <th class="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of filteredReports" class="report-row">
                <td class="col-name">
                  <div class="report-cell">
                    <div class="report-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                        <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                        <path d="M10 9H8"></path>
                        <path d="M16 13H8"></path>
                        <path d="M16 17H8"></path>
                      </svg>
                    </div>
                    <div class="report-info">
                      <span class="report-name">{{ report.name }}</span>
                      <span class="report-description">{{ report.description }}</span>
                    </div>
                  </div>
                </td>
                <td class="col-level">
                  <span class="level-badge" [style.backgroundColor]="report.rowLevelBg">
                    {{ report.rowLevel }}
                  </span>
                </td>
                <td class="col-action">
                  <button class="view-button" (click)="viewReport(report)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Report View -->
      <div *ngIf="selectedReport && selectedReport.id === 'active-census'" class="detailed-report-card">
        <div class="report-controls">
          <div class="controls-left">
            <input
              type="text"
              placeholder="Search by patient name, ID, or enrollment ID..."
              [(ngModel)]="patientSearchQuery"
              (input)="filterPatientRecords()"
              class="search-input-detailed"
            >
          </div>
          <div class="controls-right">
            <button class="btn-export">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M2 12h20"></path>
              </svg>
              Export
            </button>
          </div>
        </div>

        <div class="table-wrapper-detailed">
          <table class="detail-table">
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Medicaid ID</th>
                <th>Gender</th>
                <th>Age</th>
                <th>DOB</th>
                <th>County</th>
                <th>Home Facility</th>
                <th>Active Prescription</th>
                <th>Last Dose Date</th>
                <th>Administered By</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of filteredPatientRecords" class="patient-row">
                <td>{{ record.enrollmentId }}</td>
                <td class="patient-id-cell">
                  <button
                    class="patient-link"
                    (click)="navigateToPatient(record)"
                  >
                    {{ record.patientId }}
                  </button>
                </td>
                <td class="patient-name-cell">
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.lastName }}, {{ record.firstName }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    [Restricted Access]
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.medicaidId }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.gender }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.age }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.dob }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.county }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>{{ record.homeFacility }}</td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.activePrescription }} {{ record.prescriptionDose }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.lastDoseDate }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
                <td>
                  <span *ngIf="canViewPatientData(record)">
                    {{ record.administeredBy }}
                  </span>
                  <span *ngIf="!canViewPatientData(record)" class="restricted-text">
                    ***
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="report-footer">
          <span class="record-count">
            Showing {{ filteredPatientRecords.length }} of {{ patientCensusData.length }} records
          </span>
        </div>
      </div>

      <!-- Break Glass Modal -->
      <div *ngIf="showBreakGlassModal" class="modal-overlay" (click)="closeBreakGlassModal()">
        <div class="modal-content break-glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M12 12v5"></path>
              <path d="M12 19h.01"></path>
            </svg>
            <h2>Patient Access Restricted</h2>
            <button class="btn-close-modal" (click)="closeBreakGlassModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6l-12 12M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <p class="modal-description">
              You are attempting to access patient data from another facility. This action will be audited.
            </p>

            <div class="access-details">
              <h4>Patient Information</h4>
              <div class="detail-row">
                <span class="detail-label">Patient ID:</span>
                <span class="detail-value">{{ breakGlassData?.patientId }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Patient Name:</span>
                <span class="detail-value">{{ breakGlassData?.patientName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Home Facility:</span>
                <span class="detail-value">{{ breakGlassData?.patientFacilityId }}</span>
              </div>
            </div>

            <div class="attestation-section">
              <label class="attestation-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="breakGlassData.attestationConfirmed"
                  name="attestation"
                />
                <span>
                  I attest that I am accessing this patient record for the purpose of authorized care coordination and have obtained necessary documentation and approvals. This action is audited.
                </span>
              </label>
            </div>

            <div class="modal-actions">
              <button class="btn-cancel" (click)="closeBreakGlassModal()">Cancel</button>
              <button
                class="btn-confirm"
                [disabled]="!breakGlassData?.attestationConfirmed"
                (click)="confirmBreakGlassAccess()"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header Section */
    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .header-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #3b82f6;
    }

    /* Reports Card */
    .reports-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    /* Card Header */
    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      md-flex-direction: row;
      gap: 1.5rem;
      justify-content: space-between;
      align-items: flex-start;
      md-align-items: center;
    }

    .header-title {
      flex: 1;

      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
      }

      p {
        margin: 0;
        font-size: 0.8125rem;
        color: #6b7280;
      }
    }

    .search-container {
      position: relative;
      width: 100%;
      max-width: 224px;

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1rem;
        height: 1rem;
        color: #6b7280;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2.25rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: white;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    /* Table */
    .table-wrapper {
      flex: 1;
      overflow-x: auto;
      overflow-y: auto;
    }

    .reports-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        background: white;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        border-bottom: 1px solid #e5e7eb;
        height: 2rem;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: middle;
      }

      tbody tr {
        transition: background-color 0.2s;

        &:hover {
          background-color: #f9fafb;
        }
      }
    }

    .col-name {
      width: 280px;
    }

    .col-level {
      width: 120px;
    }

    .col-action {
      width: auto;
      text-align: right;
      padding-right: 1rem;
    }

    .report-cell {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .report-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 0.375rem;
      flex-shrink: 0;

      svg {
        width: 0.875rem;
        height: 0.875rem;
        color: #3b82f6;
      }
    }

    .report-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .report-name {
      font-weight: 500;
      color: #1f2937;
      display: block;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .report-row:hover .report-name {
      color: #3b82f6;
    }

    .report-description {
      font-size: 0.8125rem;
      color: #6b7280;
      display: block;
      line-height: 1.4;
    }

    .level-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #374151;
      white-space: nowrap;
    }

    .view-button {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: #6b7280;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      svg {
        width: 0.875rem;
        height: 0.875rem;
      }

      &:hover {
        color: #3b82f6;
        background: #f3f4f6;
      }
    }

    /* Back Button */
    .btn-back {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        color: #1f2937;
      }

      svg {
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    /* Detailed Report Card */
    .detailed-report-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    .report-controls {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .controls-left {
      flex: 1;
    }

    .search-input-detailed {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .controls-right {
      display: flex;
      gap: 0.75rem;
    }

    .btn-export {
      padding: 0.625rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;

      &:hover {
        background: #2563eb;
      }

      svg {
        width: 1rem;
        height: 1rem;
      }
    }

    .table-wrapper-detailed {
      flex: 1;
      overflow: auto;
      min-height: 0;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        background: #f9fafb;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      th {
        padding: 0.875rem 1rem;
        text-align: left;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: middle;
      }

      tbody tr {
        transition: background-color 0.15s;

        &:hover {
          background-color: #f9fafb;
        }
      }
    }

    .patient-row {
      &:hover {
        background-color: #f3f4f6;
      }
    }

    .patient-id-cell {
      min-width: 100px;
    }

    .patient-link {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
      padding: 0;
      transition: color 0.2s;

      &:hover {
        color: #1f59b8;
        text-decoration: underline;
      }
    }

    .patient-name-cell {
      font-weight: 500;
      color: #1f2937;
    }

    .restricted-text {
      color: #9ca3af;
      font-style: italic;
    }

    .report-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      text-align: right;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .record-count {
      font-weight: 500;
    }

    /* Break Glass Modal */
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
      z-index: 9999;
    }

    .modal-content {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .break-glass-modal {
      max-width: 550px;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      position: relative;

      svg {
        width: 1.5rem;
        height: 1.5rem;
        color: #dc2626;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
        color: #1f2937;
        flex: 1;
      }

      .btn-close-modal {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        color: #6b7280;
        display: flex;
        align-items: center;
        position: absolute;
        top: 1rem;
        right: 1rem;

        svg {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }

        &:hover {
          color: #1f2937;
        }
      }
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .modal-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .access-details {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;

      h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;

        &:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 500;
        }
      }
    }

    .attestation-section {
      background: #fef3c7;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #fcd34d;

      .attestation-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;

        input {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          margin-top: 0.25rem;
          accent-color: #dc2626;
          flex-shrink: 0;
        }

        span {
          font-size: 0.875rem;
          color: #92400e;
          line-height: 1.5;
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      padding: 0.625rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;

      &:hover {
        background: #f9fafb;
      }
    }

    .btn-confirm {
      background: #dc2626;
      color: white;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }

      &:disabled {
        background: #d1d5db;
        cursor: not-allowed;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .reports-container {
        padding: 1rem;
      }

      .card-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-container {
        max-width: 100%;
      }

      .header-content h2 {
        font-size: 1.25rem;
      }

      .col-name {
        width: auto;
        min-width: 200px;
      }

      .report-icon {
        display: none;
      }

      .report-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .controls-left,
      .controls-right {
        width: 100%;
      }

      .detail-table {
        font-size: 0.75rem;

        th, td {
          padding: 0.5rem 0.75rem;
        }
      }
    }
  `]
})
export class ComplianceComponent implements OnInit {
  searchQuery = '';
  patientSearchQuery = '';
  selectedReport: Report | null = null;

  // Current user's facility - Wasilla facility
  currentUserFacilityId = 'fac-cms-001';

  // Patient Census Data - Must match PatientService sample patients
  patientCensusData: PatientCensusRecord[] = [
    {
      enrollmentId: 'ENR-001',
      patientId: 'patient-001',
      firstName: 'Maverick',
      lastName: 'Nelson',
      medicaidId: 'MAI-12345678',
      gender: 'Male',
      age: 35,
      dob: '1988-12-06',
      county: 'Matanuska-Susitna',
      homeFacility: 'Community Medical Services – Wasilla',
      facilityId: 'fac-cms-001',
      activePrescription: 'Methadone',
      prescriptionDose: '90mg',
      lastDoseDate: '02/05/2026',
      administeredBy: 'Dr. Sarah Johnson',
      enrollmentDate: '2024-05-12',
      currentPhase: 'Stable Maintenance'
    },
    {
      enrollmentId: 'ENR-002',
      patientId: 'patient-002',
      firstName: 'James',
      lastName: 'Smith',
      medicaidId: 'MAI-87654321',
      gender: 'Male',
      age: 33,
      dob: '1990-03-15',
      county: 'Anchorage',
      homeFacility: 'SEARHC – Ketchikan',
      facilityId: 'fac-searhc-001',
      activePrescription: 'Methadone',
      prescriptionDose: '75mg',
      lastDoseDate: '02/04/2026',
      administeredBy: 'Nurse John Doe',
      enrollmentDate: '2024-08-20',
      currentPhase: 'Early Stabilization'
    },
    {
      enrollmentId: 'ENR-003',
      patientId: 'patient-003',
      firstName: 'Sarah',
      lastName: 'Johnson',
      medicaidId: 'MAI-55555555',
      gender: 'Female',
      age: 40,
      dob: '1985-07-22',
      county: 'Juneau',
      homeFacility: 'SEARHC – Juneau',
      facilityId: 'fac-searhc-002',
      activePrescription: 'Buprenorphine',
      prescriptionDose: '16mg',
      lastDoseDate: '02/05/2026',
      administeredBy: 'Dr. Maria Garcia',
      enrollmentDate: '2024-02-10',
      currentPhase: 'Stable Maintenance'
    },
    {
      enrollmentId: 'ENR-004',
      patientId: 'patient-004',
      firstName: 'Michael',
      lastName: 'Chen',
      medicaidId: 'MAI-66666666',
      gender: 'Male',
      age: 42,
      dob: '1983-09-18',
      county: 'Anchorage',
      homeFacility: 'Community Medical Services – Wasilla',
      facilityId: 'fac-cms-001',
      activePrescription: 'Methadone',
      prescriptionDose: '85mg',
      lastDoseDate: '02/03/2026',
      administeredBy: 'Nurse Elena Martinez',
      enrollmentDate: '2023-11-05',
      currentPhase: 'Maintenance'
    },
    {
      enrollmentId: 'ENR-005',
      patientId: 'patient-005',
      firstName: 'Jessica',
      lastName: 'Rodriguez',
      medicaidId: 'MAI-77777777',
      gender: 'Female',
      age: 29,
      dob: '1996-04-28',
      county: 'Ketchikan',
      homeFacility: 'SEARHC – Ketchikan',
      facilityId: 'fac-searhc-001',
      activePrescription: 'Buprenorphine',
      prescriptionDose: '12mg',
      lastDoseDate: '02/05/2026',
      administeredBy: 'Dr. Tom Richardson',
      enrollmentDate: '2024-01-17',
      currentPhase: 'Stable Maintenance'
    },
    {
      enrollmentId: 'ENR-006',
      patientId: 'patient-006',
      firstName: 'Robert',
      lastName: 'Williams',
      medicaidId: 'MAI-88888888',
      gender: 'Male',
      age: 55,
      dob: '1970-11-03',
      county: 'Fairbanks',
      homeFacility: 'SEARHC – Juneau',
      facilityId: 'fac-searhc-002',
      activePrescription: 'Methadone',
      prescriptionDose: '100mg',
      lastDoseDate: '02/04/2026',
      administeredBy: 'Nurse Lisa Chen',
      enrollmentDate: '2023-06-22',
      currentPhase: 'Stable Maintenance'
    },
    {
      enrollmentId: 'ENR-007',
      patientId: 'patient-007',
      firstName: 'Angela',
      lastName: 'Martinez',
      medicaidId: 'MAI-99999999',
      gender: 'Female',
      age: 38,
      dob: '1987-05-14',
      county: 'Matanuska-Susitna',
      homeFacility: 'Community Medical Services – Wasilla',
      facilityId: 'fac-cms-001',
      activePrescription: 'Buprenorphine',
      prescriptionDose: '20mg',
      lastDoseDate: '02/05/2026',
      administeredBy: 'Dr. Sarah Johnson',
      enrollmentDate: '2024-03-08',
      currentPhase: 'Induction Phase'
    },
    {
      enrollmentId: 'ENR-008',
      patientId: 'patient-008',
      firstName: 'David',
      lastName: 'Thompson',
      medicaidId: 'MAI-10101010',
      gender: 'Male',
      age: 47,
      dob: '1978-08-30',
      county: 'Anchorage',
      homeFacility: 'SEARHC – Ketchikan',
      facilityId: 'fac-searhc-001',
      activePrescription: 'Methadone',
      prescriptionDose: '70mg',
      lastDoseDate: '02/05/2026',
      administeredBy: 'Nurse John Doe',
      enrollmentDate: '2024-07-15',
      currentPhase: 'Maintenance'
    }
  ];

  filteredPatientRecords: PatientCensusRecord[] = [];
  grantedBreakGlassAccess: Set<string> = new Set();

  // Break Glass Modal
  showBreakGlassModal = false;
  breakGlassData: BreakGlassAccess = {
    patientId: '',
    patientName: '',
    requestingFacilityId: this.currentUserFacilityId,
    patientFacilityId: '',
    attestationConfirmed: false
  };

  reports: Report[] = [
    {
      id: 'active-census',
      name: 'Active Patient Census',
      description: 'Active patient census including enrollment dates, current phases, and primary counselor assignments.',
      rowLevel: 'Patient',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'guest-dosing',
      name: 'Guest Dosing Activity Report',
      description: 'Track and audit all guest dosing events to ensure home clinic authorization.',
      rowLevel: 'Dose',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'mmu-activity',
      name: 'MMU Activity Report',
      description: 'Track and report on patients utilizing Mobile Medication Unit (MMU) services.',
      rowLevel: 'MMU Encounter',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'patient-movement',
      name: 'Patient Movement',
      description: 'Summary of enrollments, inactivations, and transfers (internal and external).',
      rowLevel: 'Patient',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'pdmp-log',
      name: 'PDMP Submission Log',
      description: 'Detailed log of all Schedule II-V controlled substance dispensations submitted to the state PDMP.',
      rowLevel: 'Dose',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'program-billing',
      name: 'Program Billing',
      description: 'Billable services summary for Medicaid and private insurance reimbursement.',
      rowLevel: 'Dose',
      rowLevelBg: '#e0e7ff'
    },
    {
      id: 'transaction-list',
      name: 'Transaction List',
      description: 'Comprehensive list of all medication dispensing transactions, inventory adjustments, and voids.',
      rowLevel: 'Dose',
      rowLevelBg: '#e0e7ff'
    }
  ];

  filteredReports: Report[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredReports = [...this.reports];
    this.filteredPatientRecords = [...this.patientCensusData];
  }

  filterReports(): void {
    if (!this.searchQuery.trim()) {
      this.filteredReports = [...this.reports];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredReports = this.reports.filter(report =>
      report.name.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.rowLevel.toLowerCase().includes(query)
    );
  }

  viewReport(report: Report): void {
    this.selectedReport = report;
    this.patientSearchQuery = '';
    this.filterPatientRecords();
  }

  backToReportsList(): void {
    this.selectedReport = null;
    this.patientSearchQuery = '';
  }

  filterPatientRecords(): void {
    if (!this.patientSearchQuery.trim()) {
      this.filteredPatientRecords = [...this.patientCensusData];
      return;
    }

    const query = this.patientSearchQuery.toLowerCase();
    this.filteredPatientRecords = this.patientCensusData.filter(record =>
      record.lastName.toLowerCase().includes(query) ||
      record.firstName.toLowerCase().includes(query) ||
      record.patientId.toLowerCase().includes(query) ||
      record.enrollmentId.toLowerCase().includes(query) ||
      record.medicaidId.toLowerCase().includes(query)
    );
  }

  canViewPatientData(record: PatientCensusRecord): boolean {
    // Can view data from own facility or if break glass access was granted
    return record.facilityId === this.currentUserFacilityId ||
           this.grantedBreakGlassAccess.has(record.patientId);
  }

  navigateToPatient(record: PatientCensusRecord): void {
    if (!this.canViewPatientData(record)) {
      // Show break glass modal
      this.breakGlassData = {
        patientId: record.patientId,
        patientName: `${record.lastName}, ${record.firstName}`,
        requestingFacilityId: this.currentUserFacilityId,
        patientFacilityId: record.homeFacility,
        attestationConfirmed: false
      };
      this.showBreakGlassModal = true;
      return;
    }

    // Navigate to patient page
    this.router.navigate(['/patient', record.patientId]);
  }

  closeBreakGlassModal(): void {
    this.showBreakGlassModal = false;
    this.breakGlassData = {
      patientId: '',
      patientName: '',
      requestingFacilityId: this.currentUserFacilityId,
      patientFacilityId: '',
      attestationConfirmed: false
    };
  }

  confirmBreakGlassAccess(): void {
    if (this.breakGlassData.attestationConfirmed && this.breakGlassData.patientId) {
      this.grantedBreakGlassAccess.add(this.breakGlassData.patientId);
      const patientId = this.breakGlassData.patientId;
      this.closeBreakGlassModal();

      // Navigate to patient page
      this.router.navigate(['/patient', patientId]);
    }
  }
}
