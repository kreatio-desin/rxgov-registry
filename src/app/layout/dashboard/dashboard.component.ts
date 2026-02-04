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
                <tr *ngFor="let patient of recentPatients">
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

          <!-- Mobile Cards -->
          <div class="md:hidden space-y-3">
            <div *ngFor="let patient of recentPatients" class="patient-card">
              <div class="card-header">
                <div>
                  <div class="card-rxid">{{ patient.rxId }}</div>
                  <div class="card-name">{{ patient.name }}</div>
                </div>
                <span class="badge" [class]="'badge-' + patient.status">
                  {{ patient.status | titlecase }}
                </span>
              </div>
              <div class="card-grid">
                <div class="card-item">
                  <div class="card-label">DOB</div>
                  <div>{{ patient.dob }}</div>
                </div>
                <div class="card-item">
                  <div class="card-label">SSN (Last 4)</div>
                  <div class="ssn-masked">{{ patient.ssn }}</div>
                </div>
              </div>
              <div class="card-dose">
                <div class="card-label">Last Dose</div>
                <div class="dose-time">{{ patient.lastDose }}</div>
                <div class="dose-info">{{ patient.lastDoseInfo }}</div>
              </div>
            </div>
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
      background: #0066cc;
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
        background: #0052a3;
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
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
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
      background: white;
      border: 1px solid #d1d5db;
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
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      thead {
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }

      th {
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #374151;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid #f3f4f6;
        color: #1f2937;
      }

      tbody tr:hover {
        background: #f9fafb;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }
    }

    .cell-rxid {
      font-family: monospace;
      font-size: 12px;
      color: #0066cc;
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
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;

      &:active {
        background: #f9fafb;
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
  `]
})
export class DashboardComponent implements OnInit {
  transfers: Transfer[] = [
    {
      id: '1',
      patientName: 'Taylor, Juniper',
      fromFacility: 'Community Medical Services – Wasilla',
      status: 'pending'
    },
    {
      id: '2',
      patientName: 'Davis, Grayson',
      fromFacility: 'SEARHC – Ketchikan',
      status: 'pending'
    },
    {
      id: '3',
      patientName: 'Miller, Sedna',
      fromFacility: 'SEARHC – Juneau',
      status: 'pending'
    }
  ];

  recentPatients: PatientRecord[] = [
    {
      id: '1',
      rxId: 'RX-2233445566',
      name: 'Nelson, Maverick "Mav"',
      dob: 'Dec 6, 1988',
      ssn: '***-**-1234',
      status: 'active',
      lastDose: 'Feb 4, 1:33 PM',
      lastDoseInfo: '60mg Methadone'
    }
  ];

  constructor(
    private facilityService: FacilityService,
    private patientService: PatientService,
    private syncService: SyncService
  ) {}

  async ngOnInit(): Promise<void> {
    // Load dashboard data
  }
}
