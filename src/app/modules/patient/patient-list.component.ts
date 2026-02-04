import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { FacilityService } from '../../core/services/facility.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="patient-list-container">
      <div class="list-header">
        <h1>Patients</h1>
        <button class="btn btn-primary" (click)="navigateToAdmit()">
          <i class="bi bi-plus-circle"></i>
          Admit New Patient
        </button>
      </div>

      <div *ngIf="patients.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <h2>No patients yet</h2>
        <p>Admit your first patient to get started</p>
      </div>

      <div *ngIf="patients.length > 0" class="patients-table-container">
        <table class="patients-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Registry ID</th>
              <th>Date of Birth</th>
              <th>Current Status</th>
              <th>Facility</th>
              <th>Medication</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of patients">
              <td class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</td>
              <td class="registry-id">{{ patient.registryId }}</td>
              <td>{{ patient.dateOfBirth | date:'short' }}</td>
              <td>
                <span class="status-badge" [class]="patient.currentEnrollment?.status">
                  {{ patient.currentEnrollment?.status || 'No Enrollment' }}
                </span>
              </td>
              <td>{{ patient.currentEnrollment?.facilityName || '-' }}</td>
              <td>{{ patient.currentEnrollment?.moudType || '-' }}</td>
              <td>
                <a [routerLink]="['/patient', patient.id]" class="btn btn-sm btn-secondary">
                  <i class="bi bi-eye"></i>
                  View
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .patient-list-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        color: #333;
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;

      &.btn-primary {
        background: #0c5caa;
        color: white;

        &:hover {
          background: #0a4a85;
          transform: translateY(-2px);
        }
      }

      &.btn-secondary {
        background: #6c757d;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;

        &:hover {
          background: #5a6268;
        }
      }

      &.btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;

      i {
        font-size: 4rem;
        color: #ccc;
        display: block;
        margin-bottom: 1rem;
      }

      h2 {
        color: #666;
        margin: 0;
      }

      p {
        color: #999;
        margin-top: 0.5rem;
      }
    }

    .patients-table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
      }

      th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #333;
        white-space: nowrap;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
        color: #333;
      }

      tbody tr:hover {
        background-color: #f8f9fa;
      }
    }

    .patient-name {
      font-weight: bold;
      color: #0c5caa;
    }

    .registry-id {
      font-family: monospace;
      color: #666;
      font-size: 0.9rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: bold;
      text-transform: capitalize;

      &.active {
        background: #d4edda;
        color: #155724;
      }

      &.inactive {
        background: #e2e3e5;
        color: #383d41;
      }

      &.transferred {
        background: #d1ecf1;
        color: #0c5257;
      }

      &.terminated {
        background: #f8d7da;
        color: #721c24;
      }
    }

    @media (max-width: 768px) {
      .patients-table {
        font-size: 0.9rem;

        th, td {
          padding: 0.75rem;
        }
      }
    }
  `]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];

  constructor(private patientService: PatientService) {}

  async ngOnInit(): Promise<void> {
    await this.loadPatients();
  }

  private async loadPatients(): Promise<void> {
    try {
      // For now, load all patients - in production this would be filtered by user's facility
      // const patients = await this.patientService.getAll();
      // this.patients = patients;
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  }

  navigateToAdmit(): void {
    // Navigate to admit component
  }
}
