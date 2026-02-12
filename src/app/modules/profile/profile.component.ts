import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <button class="back-button" (click)="goBack()">
          <i class="bi bi-arrow-left"></i>
          Back
        </button>
        <h1>My Profile</h1>
      </div>

      <div class="profile-content" *ngIf="currentUser">
        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-placeholder">
              {{ getInitials(currentUser.name) }}
            </div>
          </div>

          <div class="profile-info-section">
            <h2>Personal Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Full Name</label>
                <p>{{ currentUser.name }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ currentUser.email }}</p>
              </div>
              <div class="info-item">
                <label>Role</label>
                <div class="role-badge" [attr.data-role]="currentUser.role">
                  {{ getRoleDisplayName(currentUser.role) }}
                </div>
              </div>
              <div class="info-item">
                <label>Facility</label>
                <p>{{ currentUser.facilityName || 'System Administrator' }}</p>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button class="action-button secondary" (click)="goBack()">
              <i class="bi bi-arrow-left"></i>
              Back to App
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!currentUser" class="empty-state">
        <p>No user information available</p>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
      }

      .back-button {
        background: none;
        border: none;
        color: var(--color-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
        padding: 8px;
        border-radius: 6px;
        transition: background 0.2s;

        &:hover {
          background: var(--color-bg-tertiary);
        }

        i {
          font-size: 16px;
        }
      }

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .profile-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .profile-card {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .profile-avatar {
        display: flex;
        justify-content: center;
      }

      .avatar-placeholder {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: 600;
      }

      .profile-info-section {
        display: flex;
        flex-direction: column;
        gap: 16px;

        h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--color-text-primary);
          font-weight: 500;
        }
      }

      .role-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        width: fit-content;

        &[data-role='admin'] {
          background: #dbeafe;
          color: #1e40af;
        }

        &[data-role='facility-manager'] {
          background: #e9d5ff;
          color: #7c3aed;
        }

        &[data-role='facility-staff'] {
          background: #dcfce7;
          color: #166534;
        }
      }

      .permissions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .permission-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: var(--color-text-primary);

        i {
          color: #22c55e;
          font-size: 16px;
        }
      }

      .profile-actions {
        display: flex;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
      }

      .action-button {
        flex: 1;
        padding: 12px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;

        &.secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);

          &:hover {
            background: var(--color-bg-secondary);
          }
        }

        i {
          font-size: 16px;
        }
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--color-text-secondary);
      }

      @media (max-width: 640px) {
        .profile-container {
          padding: 16px;
        }

        .profile-card {
          padding: 20px;
          gap: 24px;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          font-size: 36px;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        h1 {
          font-size: 24px;
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getRoleDisplayName(role: string | null | undefined): string {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'facility-manager':
        return 'Facility Manager';
      case 'facility-staff':
        return 'Facility Staff';
      default:
        return '';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatPermission(permission: string): string {
    return permission
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
