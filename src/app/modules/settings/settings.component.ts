import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SyncService, SyncConfig } from '../../core/services/sync.service';
import { AuthService, AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h1>System Settings</h1>
      <p class="subtitle">Configure integrations, sync behavior, and system preferences</p>

      <div class="settings-tabs">
        <button 
          class="tab-button"
          [class.active]="activeTab === 'sync'"
          (click)="activeTab = 'sync'"
        >
          <i class="bi bi-cloud-sync"></i>
          Synchronization
        </button>
        <button 
          class="tab-button"
          [class.active]="activeTab === 'integrations'"
          (click)="activeTab = 'integrations'"
        >
          <i class="bi bi-plug"></i>
          Integrations
        </button>
        <button
          class="tab-button"
          [class.active]="activeTab === 'data-quality'"
          (click)="activeTab = 'data-quality'"
        >
          <i class="bi bi-graph-up"></i>
          Data Quality
        </button>
        <button
          class="tab-button"
          [class.active]="activeTab === 'users'"
          (click)="activeTab = 'users'"
          *ngIf="currentUser && (currentUser.role === 'facility-manager' || currentUser.role === 'admin')"
        >
          <i class="bi bi-people"></i>
          Users
        </button>
      </div>

      <div class="settings-content">
        <!-- Synchronization Tab -->
        <div *ngIf="activeTab === 'sync'" class="tab-content">
          <section class="settings-section">
            <h2>Sync Configuration</h2>
            <p class="section-desc">Configure automatic synchronization with central registry and PDMP</p>

            <div class="setting-group">
              <label>
                <input type="checkbox" [(ngModel)]="syncEnabled" (change)="onSyncEnabledChange()">
                Enable automatic synchronization
              </label>
              <p class="help-text">
                When enabled, the system will automatically sync records when connectivity is restored
              </p>
            </div>

            <div *ngIf="syncEnabled" class="setting-group">
              <label>Sync Frequency (minutes)</label>
              <select [(ngModel)]="syncFrequencyMinutes" (change)="onSyncFrequencyChange()">
                <option [value]="1">Every 1 minute</option>
                <option [value]="5">Every 5 minutes</option>
                <option [value]="15">Every 15 minutes</option>
                <option [value]="60">Every hour</option>
                <option [value]="240">Every 4 hours</option>
                <option [value]="1440">Daily</option>
              </select>
              <p class="help-text">
                System will attempt to sync pending records at this interval when online
              </p>
            </div>

            <div *ngIf="syncEnabled" class="setting-group">
              <label>Max Retry Attempts</label>
              <select [(ngModel)]="maxRetries" (change)="onMaxRetriesChange()">
                <option [value]="1">1 attempt</option>
                <option [value]="3">3 attempts</option>
                <option [value]="5">5 attempts</option>
                <option [value]="10">10 attempts</option>
              </select>
              <p class="help-text">
                Failed syncs will be retried up to this many times before manual intervention is needed
              </p>
            </div>

            <div class="pending-syncs">
              <h3>Pending Synchronizations</h3>
              <p *ngIf="pendingCount === 0" class="success">
                <i class="bi bi-check-circle"></i>
                All records synced - no pending items
              </p>
              <p *ngIf="pendingCount > 0" class="warning">
                <i class="bi bi-exclamation-circle"></i>
                {{ pendingCount }} records waiting to sync
              </p>
              <button class="btn btn-primary" (click)="triggerSync()" [disabled]="!syncEnabled">
                Trigger Sync Now
              </button>
            </div>
          </section>
        </div>

        <!-- Integrations Tab -->
        <div *ngIf="activeTab === 'integrations'" class="tab-content">
          <section class="settings-section">
            <h2>External System Integrations</h2>
            <p class="section-desc">Configure connections to dispensing systems and PDMP</p>

            <div class="integration-cards">
              <div class="integration-card">
                <div class="integration-header">
                  <h3>Alaska PDMP</h3>
                  <span class="status-badge active">Connected</span>
                </div>
                <p class="description">Alaska Prescription Monitoring Program for daily dosage reporting</p>
                <div class="settings-form">
                  <div class="form-group">
                    <label>API Endpoint</label>
                    <input type="text" value="https://pdmp.alaska.gov/api/v1" disabled>
                  </div>
                  <div class="form-group">
                    <label>Last Submission</label>
                    <p>Today at 2:30 PM (12 records)</p>
                  </div>
                  <button class="btn btn-secondary">Edit Configuration</button>
                </div>
              </div>

              <div class="integration-card">
                <div class="integration-header">
                  <h3>Methasoft</h3>
                  <span class="status-badge active">Configured</span>
                </div>
                <p class="description">Automated dosing system integration</p>
                <div class="settings-form">
                  <div class="form-group">
                    <label>Connection Status</label>
                    <p>Ready to sync from dispensing system</p>
                  </div>
                  <button class="btn btn-secondary">Edit Configuration</button>
                </div>
              </div>

              <div class="integration-card">
                <div class="integration-header">
                  <h3>Methware</h3>
                  <span class="status-badge">Not Configured</span>
                </div>
                <p class="description">Alternative dispensing system integration</p>
                <div class="settings-form">
                  <p class="help-text">Configure if your facility uses Methware for medication management</p>
                  <button class="btn btn-primary">Configure Integration</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Data Quality Tab -->
        <div *ngIf="activeTab === 'data-quality'" class="tab-content">
          <section class="settings-section">
            <h2>Data Quality Management</h2>
            <p class="section-desc">Monitor and resolve data quality issues</p>

            <div class="quality-issues">
              <div class="issue-card">
                <div class="issue-header">
                  <span class="issue-count">3</span>
                  <h3>Missing Dosage Updates</h3>
                </div>
                <p>Patients without recent dosage records in the last 7 days</p>
                <button class="btn btn-secondary">Review Issues</button>
              </div>

              <div class="issue-card">
                <div class="issue-header">
                  <span class="issue-count">0</span>
                  <h3>Sync Failures</h3>
                </div>
                <p>Records that failed to sync to central registry</p>
                <button class="btn btn-secondary" disabled>No Issues</button>
              </div>

              <div class="issue-card">
                <div class="issue-header">
                  <span class="issue-count">1</span>
                  <h3>Inconsistent Data</h3>
                </div>
                <p>Potential duplicates or conflicting information</p>
                <button class="btn btn-secondary">Review Issues</button>
              </div>
            </div>

            <div class="data-validation">
              <h3>Data Validation</h3>
              <div class="validation-items">
                <div class="validation-item">
                  <i class="bi bi-check-circle-fill success"></i>
                  <div>
                    <p class="item-title">Dual Enrollment Check</p>
                    <p class="item-desc">Last run: 2 hours ago - No conflicts</p>
                  </div>
                </div>
                <div class="validation-item">
                  <i class="bi bi-check-circle-fill success"></i>
                  <div>
                    <p class="item-title">Patient Demographics</p>
                    <p class="item-desc">All required fields present</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users'" class="tab-content">
          <section class="settings-section">
            <h2>Facility Users</h2>
            <p class="section-desc">
              <span *ngIf="currentUser?.role === 'facility-manager'">Manage team members for {{ currentUser.facilityName }}</span>
              <span *ngIf="currentUser?.role === 'admin'">View and manage all system users</span>
            </p>

            <div class="users-list">
              <div *ngIf="filteredUsers.length === 0" class="empty-state">
                <p>No users found</p>
              </div>

              <div *ngFor="let user of filteredUsers" class="user-card">
                <div class="user-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-role">{{ getRoleDisplayName(user.role) }}</div>
                  <div class="user-facility" *ngIf="user.facilityName">{{ user.facilityName }}</div>
                </div>
                <div class="user-actions">
                  <button class="btn-edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-delete" title="Remove" *ngIf="currentUser?.role === 'admin' || (currentUser?.role === 'facility-manager' && user.role !== 'facility-manager')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;

      h1 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #666;
        margin-bottom: 2rem;
      }
    }

    .settings-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid #dee2e6;
    }

    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: #666;
      cursor: pointer;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;

      i {
        font-size: 1.1rem;
      }

      &:hover {
        color: #0c5caa;
      }

      &.active {
        color: #0c5caa;
        border-bottom-color: #0c5caa;
      }
    }

    .tab-content {
      animation: fadeIn 0.2s;
    }

    .settings-section {
      background: var(--color-bg-primary);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
      }

      .section-desc {
        margin: 0 0 1.5rem 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }
    }

    .setting-group {
      margin-bottom: 2rem;

      label {
        display: block;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.5rem;
      }

      input[type="checkbox"] {
        margin-right: 0.5rem;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        font-size: 0.95rem;
        background: var(--color-bg-primary);
        color: var(--color-text-primary);

        &:focus {
          outline: none;
          border-color: var(--color-button-bg);
        }
      }

      .help-text {
        margin: 0.5rem 0 0 0;
        color: #666;
        font-size: 0.85rem;
      }
    }

    .pending-syncs {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      margin-top: 2rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      p {
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;

        &.success {
          color: #155724;
        }

        &.warning {
          color: #856404;
        }

        i {
          font-size: 1.2rem;
        }
      }
    }

    .integration-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .integration-card {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.5rem;
      background: var(--color-bg-primary);

      .integration-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h3 {
          margin: 0;
          color: var(--color-text-primary);
        }
      }

      .status-badge {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        background: #e2e3e5;
        color: #383d41;

        &.active {
          background: #d4edda;
          color: #155724;
        }
      }

      .description {
        color: var(--color-text-secondary);
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
      }

      .settings-form {
        .form-group {
          margin-bottom: 1rem;

          label {
            display: block;
            font-weight: 600;
            color: var(--color-text-primary);
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
          }

          input,
          p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
          }

          input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #dee2e6;
            border-radius: 4px;
          }
        }
      }
    }

    .quality-issues {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .issue-card {
      border-left: 4px solid #ffc107;
      padding: 1.5rem;
      background: var(--color-bg-primary);
      border-radius: 6px;
      border: 1px solid var(--color-border);

      .issue-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 0.5rem;

        .issue-count {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--color-bg-tertiary);
          border-radius: 6px;
          font-weight: bold;
          color: var(--color-text-primary);
          font-size: 1.3rem;
        }

        h3 {
          margin: 0;
          color: #333;
          flex: 1;
        }
      }

      p {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }
    }

    .data-validation {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .validation-items {
        display: grid;
        gap: 1rem;
      }

      .validation-item {
        display: flex;
        gap: 1rem;

        i {
          font-size: 1.5rem;
          color: #28a745;
          flex-shrink: 0;
        }

        .item-title {
          margin: 0 0 0.25rem 0;
          font-weight: bold;
          color: #333;
        }

        .item-desc {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;

      &.btn-primary {
        background: var(--color-button-bg);
        color: white;

        &:hover:not(:disabled) {
          background: var(--color-button-hover);
          transform: translateY(-2px);
        }
      }

      &.btn-secondary {
        background: var(--color-text-secondary);
        color: white;

        &:hover:not(:disabled) {
          background: var(--color-text-primary);
          transform: translateY(-2px);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .settings-tabs {
        flex-direction: column;
      }

      .tab-button {
        width: 100%;
      }

      .integration-cards,
      .quality-issues {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = 'sync';
  syncEnabled = true;
  syncFrequencyMinutes = 1;
  maxRetries = 3;
  pendingCount = 0;
  currentUser: AuthUser | null = null;
  filteredUsers: AuthUser[] = [];

  // Demo users for the system
  private allUsers: AuthUser[] = [
    {
      id: 'user-admin-001',
      email: 'admin@rxgov.gov',
      name: 'Dr. Lisa Johnson',
      role: 'admin',
      permissions: ['all']
    },
    {
      id: 'user-mgr-001',
      email: 'manager@anchorage-ctc.org',
      name: 'Robert Chen',
      role: 'facility-manager',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center',
      permissions: ['view_facility_patients', 'manage_facility_patients']
    },
    {
      id: 'user-mgr-002',
      email: 'manager2@cms-anc.org',
      name: 'Maria Rodriguez',
      role: 'facility-manager',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage',
      permissions: ['view_facility_patients', 'manage_facility_patients']
    },
    {
      id: 'user-staff-001',
      email: 'staff@anchorage-ctc.org',
      name: 'James Wilson',
      role: 'facility-staff',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center',
      permissions: ['view_facility_patients', 'record_doses']
    },
    {
      id: 'user-staff-002',
      email: 'staff2@cms-anc.org',
      name: 'Emily Davis',
      role: 'facility-staff',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage',
      permissions: ['view_facility_patients', 'record_doses']
    }
  ];

  constructor(private syncService: SyncService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    const pending = await this.syncService.getPendingItems();
    this.pendingCount = pending.length;

    // Load current user
    this.currentUser = this.authService.getCurrentUser();

    // Filter users based on role
    this.filterUsers();
  }

  private filterUsers(): void {
    if (!this.currentUser) {
      this.filteredUsers = [];
      return;
    }

    if (this.currentUser.role === 'admin') {
      // Admin can see all users
      this.filteredUsers = this.allUsers;
    } else if (this.currentUser.role === 'facility-manager') {
      // Facility manager can see only their facility's users
      this.filteredUsers = this.allUsers.filter(user =>
        user.facilityId === this.currentUser!.facilityId
      );
    } else {
      // Facility staff can see users from their facility
      this.filteredUsers = this.allUsers.filter(user =>
        user.facilityId === this.currentUser!.facilityId
      );
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'facility-manager':
        return 'Facility Manager';
      case 'facility-staff':
        return 'Facility Staff';
      default:
        return role;
    }
  }

  onSyncEnabledChange(): void {
    this.syncService.setSyncConfig({ enabled: this.syncEnabled });
  }

  onSyncFrequencyChange(): void {
    this.syncService.setSyncConfig({ frequency: this.syncFrequencyMinutes * 60000 });
  }

  onMaxRetriesChange(): void {
    this.syncService.setSyncConfig({ maxRetries: this.maxRetries });
  }

  async triggerSync(): Promise<void> {
    await this.syncService.triggerSync();
    const pending = await this.syncService.getPendingItems();
    this.pendingCount = pending.length;
  }
}
