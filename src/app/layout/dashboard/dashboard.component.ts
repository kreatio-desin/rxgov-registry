import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FacilityService } from '../../core/services/facility.service';
import { PatientService } from '../../core/services/patient.service';
import { SyncService } from '../../core/services/sync.service';

interface Transfer {
  id: string;
  patientName: string;
  fromFacility: string;
  status: 'pending' | 'approved' | 'completed';
  patientRxId?: string;
  patientDob?: string;
  patientSsn?: string;
  patientMedication?: string;
  patientDose?: string;
  initiatedBy?: string;
  initiatedDate?: string;
  transferNotes?: string;
}

interface PatientRecord {
  id: string;
  rxId: string;
  name: string;
  dob: string;
  ssn: string;
  status: 'active' | 'inactive' | 'transferred' | 'terminated';
  lastDose: string;
  lastDoseInfo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Add Patient Button -->
      <div class="dashboard-header">
        <button class="add-patient-btn" (click)="navigateToAdmit()">
          <i class="bi bi-plus"></i>
          Add New Patient
        </button>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Left Column - Transfer Queue (Hidden on mobile, visible on desktop) -->
        <div class="transfer-queue-section hidden lg:block">
          <div class="section-card">
            <div class="section-header">
              <h3 class="section-title">
                <i class="bi bi-arrow-left-right"></i>
                Transfer Queue
              </h3>
              <span class="badge badge-blue">{{ transfers.length }}</span>
            </div>
            <div class="transfers-list">
              <div *ngFor="let transfer of transfers" class="transfer-item">
                <div class="transfer-info">
                  <div class="transfer-name">{{ transfer.patientName }}</div>
                  <div class="transfer-from">From: {{ transfer.fromFacility }}</div>
                </div>
                <button class="btn-review" (click)="reviewTransfer(transfer)">Review</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Recent Patients -->
        <div class="recent-patients-section lg:col-span-2">
          <div class="section-header-compact">
            <i class="bi bi-clock"></i>
            <h3>Recent Patients</h3>
          </div>

          <!-- Desktop Table -->
          <div class="table-container hidden md:block">
            <table class="patients-table">
              <thead>
                <tr>
                  <th>RX ID</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>SSN (Last 4)</th>
                  <th>Status</th>
                  <th>Last Dose</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let patient of recentPatients" class="clickable-row" (click)="navigateToPatient(patient.id)">
                  <td class="cell-rxid">{{ patient.rxId }}</td>
                  <td class="cell-name">{{ patient.name }}</td>
                  <td>{{ patient.dob }}</td>
                  <td>
                    <div class="ssn-masked">{{ patient.ssn }}</div>
                  </td>
                  <td>
                    <span class="badge" [class]="'badge-' + patient.status">
                      {{ patient.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="last-dose">
                      <div>{{ patient.lastDose }}</div>
                      <div class="dose-info">{{ patient.lastDoseInfo }}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Transfer Review Modal -->
      <div *ngIf="showTransferModal" class="modal-overlay" (click)="closeTransferModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeTransferModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>Review Transfer Request</h2>
            <p>Review clinical information and accept or reject this transfer</p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Patient Information -->
            <div class="info-section">
              <h4>Patient Information</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <p class="info-value">{{ selectedTransfer?.patientName }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">RxGov ID:</span>
                  <p class="info-value font-mono">{{ selectedTransfer?.patientRxId }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">DOB:</span>
                  <p class="info-value">{{ selectedTransfer?.patientDob }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">SSN (Last 4):</span>
                  <p class="info-value font-mono">{{ selectedTransfer?.patientSsn }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Medication:</span>
                  <p class="info-value">{{ selectedTransfer?.patientMedication }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Current Dose:</span>
                  <p class="info-value">{{ selectedTransfer?.patientDose }}</p>
                </div>
              </div>
            </div>

            <!-- Transfer Details -->
            <div class="info-section">
              <h4>Transfer Details</h4>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">From:</span>
                  <p class="info-value">{{ selectedTransfer?.fromFacility }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Initiated By:</span>
                  <p class="info-value">{{ selectedTransfer?.initiatedBy }}</p>
                </div>
                <div class="info-item">
                  <span class="info-label">Initiated Date:</span>
                  <p class="info-value">{{ selectedTransfer?.initiatedDate }}</p>
                </div>
              </div>
            </div>

            <!-- Transfer Notes -->
            <div class="info-section notes-section">
              <div class="notes-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notes-icon">
                  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                  <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                  <path d="M10 9H8"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                </svg>
                <h4>Transfer Notes from Sending Provider</h4>
              </div>
              <p class="notes-text">{{ selectedTransfer?.transferNotes }}</p>
            </div>

            <!-- Responsibility Statement -->
            <div class="responsibility-section">
              <div class="responsibility-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="warning-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
                <h4>Provider Responsibility Statement</h4>
              </div>
              <p class="responsibility-text">[Configurable legal language based on state policy]</p>
              <p class="responsibility-footer">By accepting this transfer, you acknowledge responsibility for this patient's ongoing care and treatment.</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-reject" (click)="rejectTransfer()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6"></path>
                <path d="m9 9 6 6"></path>
              </svg>
              Reject Transfer
            </button>
            <button class="btn-accept" (click)="acceptTransfer()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Accept Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }

    .add-patient-btn {
      background: var(--color-button-bg);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;

      &:hover {
        background: var(--color-button-hover);
      }

      i {
        font-size: 16px;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .section-card {
      background: var(--color-bg-primary);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .section-header {
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 16px;
        color: #2563eb;
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;

      &.badge-blue {
        background: #dbeafe;
        color: #1e40af;
      }

      &.badge-active {
        background: #d1fae5;
        color: #065f46;
      }

      &.badge-inactive {
        background: #e5e7eb;
        color: #374151;
      }

      &.badge-transferred {
        background: #cffafe;
        color: #164e63;
      }

      &.badge-terminated {
        background: #fee2e2;
        color: #7f1d1d;
      }
    }

    .transfers-list {
      display: flex;
      flex-direction: column;
      divide-y: 1px;
    }

    .transfer-item {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s;

      &:hover {
        background: #f9fafb;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .transfer-info {
      flex: 1;
      min-width: 0;
    }

    .transfer-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .transfer-from {
      font-size: 12px;
      color: #6b7280;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-review {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      color: #374151;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin-left: 12px;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    }

    .section-header-compact {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;

      i {
        font-size: 16px;
        color: #6b7280;
      }
    }

    .table-container {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      thead {
        background: var(--color-bg-tertiary);
        border-bottom: 1px solid var(--color-border);
      }

      th {
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-primary);
      }

      tbody tr:hover {
      background: var(--color-bg-tertiary);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr.clickable-row {
      cursor: pointer;
      transition: background 0.15s;
    }

    tbody tr.clickable-row:hover {
      background: var(--color-bg-tertiary);
    }
    }

    .cell-rxid {
      font-family: monospace;
      font-size: 12px;
      color: var(--color-primary);
      font-weight: 600;
    }

    .cell-name {
      font-weight: 500;
    }

    .ssn-masked {
      font-family: monospace;
      font-size: 13px;
    }

    .last-dose {
      line-height: 1.4;
    }

    .dose-info {
      font-size: 12px;
      color: #6b7280;
    }

    .patient-card {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:active {
        background: #f9fafb;
      }

      &.clickable-card:hover {
        border-color: #d1d5db;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .card-rxid {
      font-family: monospace;
      font-size: 12px;
      color: #0066cc;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .card-name {
      font-weight: 600;
      color: #1f2937;
    }

    .card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .card-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-label {
      font-size: 12px;
      color: #6b7280;
    }

    .card-dose {
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .dose-time {
      font-size: 14px;
      color: #1f2937;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .recent-patients-section {
        &.lg\\:col-span-2 {
          grid-column: 1;
        }
      }
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
      max-width: 448px;
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

      &:hover {
        color: #1f2937;
      }

      svg {
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .modal-header {
      margin-bottom: 1.5rem;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .info-section {
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 0.75rem;
      background: #f9fafb;

      h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      font-size: 0.75rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .info-label {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .info-value {
      margin: 0;
      font-weight: 500;
      color: #1f2937;
    }

    .font-mono {
      font-family: monospace;
    }

    .notes-section {
      background: #eff6ff;
      border-color: #dbeafe;

      h4 {
        color: #1e40af;
      }
    }

    .notes-header {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;

      h4 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #1e40af;
      }
    }

    .notes-icon {
      width: 0.875rem;
      height: 0.875rem;
      color: #1e40af;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .notes-text {
      margin: 0;
      font-size: 0.75rem;
      color: #1f2937;
      line-height: 1.5;
      max-height: 6rem;
      overflow-y: auto;
    }

    .responsibility-section {
      border: 2px solid #fcd34d;
      border-radius: 0.5rem;
      padding: 0.75rem;
      background: #fef3c7;

      h4 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 500;
        color: #78350f;
      }
    }

    .responsibility-header {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.375rem;

      h4 {
        margin: 0;
      }
    }

    .warning-icon {
      width: 1rem;
      height: 1rem;
      color: #b45309;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .responsibility-text {
      margin: 0 0 0.5rem 0;
      font-size: 0.75rem;
      color: #78350f;
    }

    .responsibility-footer {
      margin: 0;
      font-size: 0.75rem;
      color: #92400e;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      flex-direction: column-reverse;
      sm-flex-direction: row;
      gap: 0.5rem;
      sm-justify-content: flex-end;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-reject,
    .btn-accept {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      svg {
        width: 0.875rem;
        height: 0.875rem;
      }
    }

    .btn-reject {
      border: 1px solid var(--color-border);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);

      &:hover {
        background: var(--color-bg-tertiary);
        border-color: var(--color-text-secondary);
      }
    }

    .btn-accept {
      background: var(--color-button-bg);
      color: white;
      border: 1px solid var(--color-button-hover);

      &:hover {
        background: var(--color-button-hover);
      }
    }

    @media (max-width: 640px) {
      .modal-content {
        max-width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn-reject,
      .btn-accept {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  showTransferModal = false;
  selectedTransfer: Transfer | null = null;

  transfers: Transfer[] = [
    {
      id: '1',
      patientName: 'Taylor, Juniper',
      fromFacility: 'Community Medical Services – Wasilla',
      status: 'pending',
      patientRxId: 'RX-9988776655',
      patientDob: '1991-07-08',
      patientSsn: '6789',
      patientMedication: 'Methadone',
      patientDose: '85 mg',
      initiatedBy: 'Dr. Willow Martinez',
      initiatedDate: 'Feb 1, 2026',
      transferNotes: 'Patient relocating to Anchorage for employment. Currently stable on 85mg methadone daily with 6 take-home doses per week. Last dose 12/16/24. No recent UA violations. Patient has been compliant with all treatment requirements. Recommend continuing current regimen.'
    },
    {
      id: '2',
      patientName: 'Davis, Grayson',
      fromFacility: 'SEARHC – Ketchikan',
      status: 'pending',
      patientRxId: 'RX-5544332211',
      patientDob: '1985-03-15',
      patientSsn: '4321',
      patientMedication: 'Buprenorphine',
      patientDose: '12 mg',
      initiatedBy: 'Dr. James Wilson',
      initiatedDate: 'Feb 2, 2026',
      transferNotes: 'Transfer requested for family reunification. Patient has maintained sobriety for 18 months with consistent attendance. Recommend transfer to Anchorage clinic for continuity of care.'
    },
    {
      id: '3',
      patientName: 'Miller, Sedna',
      fromFacility: 'SEARHC – Juneau',
      status: 'pending',
      patientRxId: 'RX-1122334455',
      patientDob: '1992-11-22',
      patientSsn: '5555',
      patientMedication: 'Methadone',
      patientDose: '70 mg',
      initiatedBy: 'Dr. River White',
      initiatedDate: 'Feb 3, 2026',
      transferNotes: 'Patient requested transfer for employment opportunity. Currently stable on current regimen. No clinical contraindications to transfer. Please accept and coordinate care continuation.'
    }
  ];

  recentPatients: PatientRecord[] = [
    {
      id: 'patient-001',
      rxId: 'RX-2233445566',
      name: 'Nelson, Maverick "Mav"',
      dob: 'Dec 6, 1988',
      ssn: '***-**-1234',
      status: 'active',
      lastDose: 'Feb 4, 1:33 PM',
      lastDoseInfo: '60mg Methadone'
    },
    {
      id: 'patient-002',
      rxId: 'RX-1122334455',
      name: 'Smith, James',
      dob: 'Mar 15, 1990',
      ssn: '***-**-5678',
      status: 'active',
      lastDose: 'Feb 3, 10:20 AM',
      lastDoseInfo: '55mg Methadone'
    },
    {
      id: 'patient-003',
      rxId: 'RX-9988776655',
      name: 'Johnson, Sarah',
      dob: 'Jul 22, 1985',
      ssn: '***-**-9012',
      status: 'active',
      lastDose: 'Feb 2, 2:45 PM',
      lastDoseInfo: '70mg Methadone'
    }
  ];

  constructor(
    private facilityService: FacilityService,
    private patientService: PatientService,
    private syncService: SyncService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Load dashboard data
  }

  navigateToAdmit(): void {
    this.router.navigate(['/patient/admit/new']);
  }

  navigateToPatient(patientId: string): void {
    // Grant access token for clinic staff viewing patient details
    this.patientService.grantAccessViaAttestation(
      patientId,
      'clinic-user',
      'Patient record access from clinic dashboard'
    );
    this.router.navigate(['/patient', patientId]);
  }

  reviewTransfer(transfer: Transfer): void {
    this.selectedTransfer = transfer;
    this.showTransferModal = true;
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.selectedTransfer = null;
  }

  acceptTransfer(): void {
    if (this.selectedTransfer) {
      // Update transfer status to approved
      const transferIndex = this.transfers.findIndex(t => t.id === this.selectedTransfer!.id);
      if (transferIndex !== -1) {
        this.transfers[transferIndex].status = 'approved';
      }
      // Close modal
      this.closeTransferModal();
    }
  }

  rejectTransfer(): void {
    if (this.selectedTransfer) {
      // Remove transfer from queue or mark as rejected
      this.transfers = this.transfers.filter(t => t.id !== this.selectedTransfer!.id);
      // Close modal
      this.closeTransferModal();
    }
  }
}
