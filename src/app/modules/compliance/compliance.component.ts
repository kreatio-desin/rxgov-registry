import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditService, AuditLog } from '../../core/services/audit.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="compliance-container">
      <h1>Compliance Dashboard</h1>
      <p class="subtitle">Monitor access logs, attestations, and regulatory compliance</p>

      <div class="compliance-sections">
        <section class="compliance-section">
          <div class="section-header">
            <h2>Access Control Logs</h2>
            <p>All patient record access attempts are logged for audit purposes</p>
          </div>

          <div *ngIf="auditLogs.length === 0" class="empty-state">
            <p>No access logs yet</p>
          </div>

          <div *ngIf="auditLogs.length > 0" class="logs-table-container">
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Patient ID</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of auditLogs.slice(0, 20)">
                  <td>{{ log.timestamp | date:'short' }}</td>
                  <td>{{ log.action | titlecase }}</td>
                  <td>{{ log.userId }}</td>
                  <td *ngIf="log.patientId">{{ log.patientId }}</td>
                  <td *ngIf="!log.patientId">-</td>
                  <td>
                    <span class="status-badge" [class]="log.status">
                      {{ log.status | titlecase }}
                    </span>
                  </td>
                  <td class="details">
                    <small *ngIf="log.reason">{{ log.reason }}</small>
                    <small *ngIf="!log.reason">-</small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="compliance-section">
          <div class="section-header">
            <h2>Security & Attestations</h2>
            <p>Track Break Glass access and emergency authorizations</p>
          </div>

          <div class="attestation-cards">
            <div class="attestation-card">
              <h3>Active Attestations</h3>
              <p class="stat-value">{{ activeAttestations }}</p>
              <p class="stat-desc">Emergency access tokens granted</p>
            </div>

            <div class="attestation-card">
              <h3>Access Denials</h3>
              <p class="stat-value">{{ deniedAccess }}</p>
              <p class="stat-desc">Unauthorized access attempts</p>
            </div>

            <div class="attestation-card">
              <h3>Today's Activity</h3>
              <p class="stat-value">{{ todayActivity }}</p>
              <p class="stat-desc">Actions logged today</p>
            </div>
          </div>
        </section>

        <section class="compliance-section">
          <div class="section-header">
            <h2>Regulatory Compliance</h2>
            <p>PDMP reporting and data quality metrics</p>
          </div>

          <div class="compliance-items">
            <div class="compliance-item">
              <i class="bi bi-check-circle-fill"></i>
              <div>
                <p class="item-title">PDMP Daily Submission</p>
                <p class="item-desc">Last sync: 2 hours ago</p>
              </div>
            </div>

            <div class="compliance-item">
              <i class="bi bi-exclamation-circle"></i>
              <div>
                <p class="item-title">Data Quality Issues</p>
                <p class="item-desc">3 records need correction</p>
              </div>
            </div>

            <div class="compliance-item">
              <i class="bi bi-check-circle-fill"></i>
              <div>
                <p class="item-title">Dual Enrollment Prevention</p>
                <p class="item-desc">No conflicts detected</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="compliance-actions">
        <button class="btn btn-primary">Export Audit Report</button>
        <button class="btn btn-secondary">View Data Quality Issues</button>
      </div>
    </div>
  `,
  styles: [`
    .compliance-container {
      max-width: 1200px;
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

    .compliance-sections {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .compliance-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      margin-bottom: 1.5rem;

      h2 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 6px;
      color: #999;
    }

    .logs-table-container {
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;

      thead {
        background: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
      }

      th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: #333;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid #dee2e6;
        color: #333;
      }

      tbody tr:hover {
        background-color: #f8f9fa;
      }

      .details {
        font-size: 0.85rem;
      }
    }

    .status-badge {
      display: inline-block;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: capitalize;

      &.success {
        background: #d4edda;
        color: #155724;
      }

      &.denied {
        background: #f8d7da;
        color: #721c24;
      }

      &.failed {
        background: #f8d7da;
        color: #721c24;
      }
    }

    .attestation-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .attestation-card {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1.5rem;
      text-align: center;
      border-left: 4px solid #0c5caa;

      h3 {
        margin: 0 0 0.5rem 0;
        color: #666;
        font-size: 0.95rem;
      }

      .stat-value {
        margin: 0.5rem 0;
        font-size: 2rem;
        font-weight: bold;
        color: #0c5caa;
      }

      .stat-desc {
        margin: 0;
        font-size: 0.85rem;
        color: #999;
      }
    }

    .compliance-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .compliance-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #28a745;

      i {
        font-size: 1.5rem;
        color: #28a745;
        flex-shrink: 0;
      }

      &:has(i.bi-exclamation-circle) {
        border-left-color: #ffc107;

        i {
          color: #ffc107;
        }
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

    .compliance-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;

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

        &:hover {
          background: #5a6268;
          transform: translateY(-2px);
        }
      }
    }

    @media (max-width: 768px) {
      .compliance-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .logs-table {
        font-size: 0.8rem;

        th, td {
          padding: 0.5rem;
        }
      }
    }
  `]
})
export class ComplianceComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  activeAttestations = 0;
  deniedAccess = 0;
  todayActivity = 0;

  constructor(private auditService: AuditService) {}

  async ngOnInit(): Promise<void> {
    this.auditLogs = await this.auditService.getAllAuditLogs();

    // Calculate stats
    this.deniedAccess = this.auditLogs.filter((log) => log.status === 'denied').length;
    this.activeAttestations = this.auditLogs.filter((log) => log.action === 'attestation').length;

    const today = new Date().toDateString();
    this.todayActivity = this.auditLogs.filter(
      (log) => new Date(log.timestamp).toDateString() === today
    ).length;
  }
}
