import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../core/services/facility.service';
import { PatientService } from '../../core/services/patient.service';
import { SyncService } from '../../core/services/sync.service';

interface DashboardStats {
  totalFacilities: number;
  activePatients: number;
  pendingSyncs: number;
  isOnline: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>RxGov Registry Dashboard</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-building"></i>
          </div>
          <div class="stat-content">
            <h3>Facilities</h3>
            <p class="stat-value">{{ stats.totalFacilities }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="stat-content">
            <h3>Active Patients</h3>
            <p class="stat-value">{{ stats.activePatients }}</p>
          </div>
        </div>

        <div class="stat-card" [class.warning]="stats.pendingSyncs > 0">
          <div class="stat-icon">
            <i class="bi bi-cloud-check"></i>
          </div>
          <div class="stat-content">
            <h3>Pending Syncs</h3>
            <p class="stat-value">{{ stats.pendingSyncs }}</p>
          </div>
        </div>

        <div class="stat-card" [class.online]="stats.isOnline" [class.offline]="!stats.isOnline">
          <div class="stat-icon">
            <i [class]="stats.isOnline ? 'bi bi-wifi' : 'bi bi-wifi-off'"></i>
          </div>
          <div class="stat-content">
            <h3>Connection</h3>
            <p class="stat-value">{{ stats.isOnline ? 'Online' : 'Offline' }}</p>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <section class="dashboard-section">
          <h2>Quick Start Guide</h2>
          <div class="quick-actions">
            <div class="action-card">
              <i class="bi bi-search"></i>
              <h3>Global Search</h3>
              <p>Press Ctrl+J to search for a patient by name, DOB, or SSN</p>
            </div>
            <div class="action-card">
              <i class="bi bi-person-plus"></i>
              <h3>New Patient</h3>
              <p>Admit a new patient to your facility</p>
            </div>
            <div class="action-card">
              <i class="bi bi-heart-pulse"></i>
              <h3>Dosage Record</h3>
              <p>Record a new dose for an active patient</p>
            </div>
            <div class="action-card">
              <i class="bi bi-exclamation-triangle"></i>
              <h3>Emergency Guest Dosing</h3>
              <p>Handle displaced patients during emergencies</p>
            </div>
          </div>
        </section>

        <section class="dashboard-section">
          <h2>System Information</h2>
          <div class="info-box">
            <p><strong>Application:</strong> RxGov Registry</p>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>State:</strong> Alaska</p>
            <p><strong>Mode:</strong> {{ stats.isOnline ? 'Online - Connected to Central Registry' : 'Offline - Using Local Cache' }}</p>
            <p *ngIf="stats.pendingSyncs > 0" class="warning">
              <strong>⚠ Warning:</strong> {{ stats.pendingSyncs }} records are waiting to sync when connectivity is restored
            </p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
      font-size: 2.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }

      &.warning {
        border-left: 4px solid #ffc107;
      }

      &.online {
        border-left: 4px solid #28a745;
      }

      &.offline {
        border-left: 4px solid #dc3545;
        background: #fff5f5;
      }
    }

    .stat-icon {
      font-size: 2.5rem;
      color: #0c5caa;
      flex-shrink: 0;
    }

    .stat-card.warning .stat-icon {
      color: #ffc107;
    }

    .stat-card.online .stat-icon {
      color: #28a745;
    }

    .stat-card.offline .stat-icon {
      color: #dc3545;
    }

    .stat-content {
      h3 {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        font-weight: normal;
      }

      .stat-value {
        margin: 0.5rem 0 0 0;
        font-size: 2rem;
        font-weight: bold;
        color: #0c5caa;
      }
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
    }

    .dashboard-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      h2 {
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.3rem;
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      padding: 1.5rem;
      border: 2px solid #f0f0f0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #0c5caa;
        background: #f8f9fa;
      }

      i {
        font-size: 2.5rem;
        color: #0c5caa;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1rem;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 0.85rem;
      }
    }

    .info-box {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #0c5caa;

      p {
        margin: 0.75rem 0;
        color: #333;

        &.warning {
          color: #856404;
          padding: 0.75rem;
          background: #fff3cd;
          border-radius: 4px;
          margin-top: 1rem;
        }
      }
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalFacilities: 0,
    activePatients: 0,
    pendingSyncs: 0,
    isOnline: navigator.onLine
  };

  constructor(
    private facilityService: FacilityService,
    private patientService: PatientService,
    private syncService: SyncService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadStats();

    // Subscribe to sync status changes
    this.syncService.syncStatus$.subscribe((status) => {
      this.stats.pendingSyncs = status.pendingItems;
    });

    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.stats.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.stats.isOnline = false;
    });
  }

  private async loadStats(): Promise<void> {
    const facilities = await this.facilityService.getAllFacilities();
    this.stats.totalFacilities = facilities.filter((f) => f.isActive).length;

    const syncStatus = (await this.syncService.getPendingItems()).length;
    this.stats.pendingSyncs = syncStatus;

    this.stats.isOnline = navigator.onLine;
  }
}
