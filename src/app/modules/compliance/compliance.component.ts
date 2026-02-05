import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    }
  `]
})
export class ComplianceComponent implements OnInit {
  searchQuery = '';
  
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

  ngOnInit(): void {
    this.filteredReports = [...this.reports];
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
}
