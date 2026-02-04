import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="patient-detail-container">
      <div *ngIf="!patient" class="loading">
        <i class="bi bi-hourglass-split"></i>
        <p>Loading patient information...</p>
      </div>

      <div *ngIf="patient" class="patient-detail">
        <div class="detail-header">
          <div>
            <h1>{{ patient.firstName }} {{ patient.lastName }}</h1>
            <p class="registry-id">Registry ID: {{ patient.registryId }}</p>
          </div>
          <div class="status-section">
            <span *ngIf="patient.currentEnrollment" class="status-badge" [class]="patient.currentEnrollment.status">
              {{ patient.currentEnrollment.status }}
            </span>
          </div>
        </div>

        <div class="detail-tabs">
          <button 
            class="tab-button"
            [class.active]="activeTab === 'demographics'"
            (click)="activeTab = 'demographics'"
          >
            Demographics
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab === 'enrollment'"
            (click)="activeTab = 'enrollment'"
          >
            Enrollment
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab === 'dosages'"
            (click)="activeTab = 'dosages'"
          >
            Dosages
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab === 'history'"
            (click)="activeTab = 'history'"
          >
            History
          </button>
        </div>

        <div class="detail-content">
          <!-- Demographics Tab -->
          <div *ngIf="activeTab === 'demographics'" class="tab-content">
            <div class="info-section">
              <h2>Personal Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <label>First Name</label>
                  <p>{{ patient.firstName }}</p>
                </div>
                <div class="info-item">
                  <label>Last Name</label>
                  <p>{{ patient.lastName }}</p>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <p>{{ patient.dateOfBirth | date:'short' }}</p>
                </div>
                <div class="info-item">
                  <label>SSN (Last 4)</label>
                  <p>{{ patient.ssn }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Enrollment Tab -->
          <div *ngIf="activeTab === 'enrollment'" class="tab-content">
            <div class="info-section" *ngIf="patient.currentEnrollment">
              <h2>Current Enrollment</h2>
              <div class="info-grid">
                <div class="info-item">
                  <label>Facility</label>
                  <p>{{ patient.currentEnrollment.facilityName }}</p>
                </div>
                <div class="info-item">
                  <label>Medication Type</label>
                  <p>{{ patient.currentEnrollment.moudType }}</p>
                </div>
                <div class="info-item">
                  <label>Enrollment Date</label>
                  <p>{{ patient.currentEnrollment.enrollmentDate | date:'short' }}</p>
                </div>
                <div class="info-item">
                  <label>Status</label>
                  <p>
                    <span class="status-badge" [class]="patient.currentEnrollment.status">
                      {{ patient.currentEnrollment.status }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Dosages Tab -->
          <div *ngIf="activeTab === 'dosages'" class="tab-content">
            <div class="info-section">
              <h2>Recent Dosages</h2>
              <p class="placeholder">Dosage records will be displayed here</p>
            </div>
          </div>

          <!-- History Tab -->
          <div *ngIf="activeTab === 'history'" class="tab-content">
            <div class="info-section">
              <h2>Treatment History</h2>
              <p class="placeholder">Treatment history will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-detail-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;

      i {
        font-size: 2rem;
        color: #0c5caa;
        animation: spin 2s linear infinite;
      }

      p {
        color: #666;
        margin-top: 1rem;
      }
    }

    .patient-detail {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .detail-header {
      padding: 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      .registry-id {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }
    }

    .status-section {
      display: flex;
      gap: 1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: bold;
      text-transform: capitalize;
      font-size: 0.9rem;

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

    .detail-tabs {
      display: flex;
      border-bottom: 1px solid #dee2e6;
      padding: 0 2rem;
      background: #f8f9fa;
    }

    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #0c5caa;
      }

      &.active {
        color: #0c5caa;
        border-bottom-color: #0c5caa;
      }
    }

    .detail-content {
      padding: 2rem;
    }

    .tab-content {
      animation: fadeIn 0.2s;
    }

    .info-section {
      h2 {
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.1rem;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .info-item {
      label {
        display: block;
        font-weight: bold;
        color: #666;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      p {
        margin: 0;
        color: #333;
        font-size: 1rem;
      }
    }

    .placeholder {
      text-align: center;
      color: #999;
      padding: 2rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  activeTab = 'demographics';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  async ngOnInit(): Promise<void> {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      try {
        const result = await this.patientService.getPatient(patientId);
        this.patient = result || null;
      } catch (error) {
        console.error('Failed to load patient:', error);
        this.patient = null;
      }
    }
  }
}
