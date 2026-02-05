import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../core/services/auth.service';

interface UserWithStatus extends AuthUser {
  status: 'active' | 'suspended' | 'inactive';
  lastLogin: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-container">
      <!-- Header -->
      <div class="users-header">
        <div>
          <h1>Users Management</h1>
          <p class="subtitle">
            <span *ngIf="currentUser?.role === 'facility-manager'">Manage team members for {{ currentUser.facilityName }}</span>
            <span *ngIf="currentUser?.role === 'admin'">View and manage all system users</span>
            <span *ngIf="currentUser?.role === 'facility-staff'">Users in {{ currentUser.facilityName }}</span>
          </p>
        </div>
        <button class="btn-add-user" *ngIf="currentUser && (currentUser.role === 'facility-manager' || currentUser.role === 'admin')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          Add User
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Facility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers" [class]="'status-' + user.status">
              <td class="cell-name">{{ user.name }}</td>
              <td class="cell-email">{{ user.email }}</td>
              <td class="cell-role">
                <span class="role-badge" [attr.data-role]="user.role">
                  {{ getRoleDisplayName(user.role) }}
                </span>
              </td>
              <td class="cell-status">
                <span class="status-badge" [attr.data-status]="user.status">
                  {{ user.status | titlecase }}
                </span>
              </td>
              <td class="cell-lastlogin">{{ user.lastLogin }}</td>
              <td class="cell-facility">{{ user.facilityName || 'N/A' }}</td>
              <td class="cell-actions">
                <div class="actions-group">
                  <button class="action-btn edit-btn" title="Edit user" (click)="editUser(user)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    class="action-btn suspend-btn" 
                    title="Suspend user" 
                    (click)="suspendUser(user)"
                    *ngIf="canManageUser(user) && user.status !== 'suspended'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <path d="M12 1v6"></path>
                      <path d="M12 17v6"></path>
                      <path d="M4.22 4.22l4.24 4.24"></path>
                      <path d="M15.54 15.54l4.24 4.24"></path>
                      <path d="M1 12h6"></path>
                      <path d="M17 12h6"></path>
                      <path d="M4.22 19.78l4.24-4.24"></path>
                      <path d="M15.54 8.46l4.24-4.24"></path>
                    </svg>
                  </button>
                  <button 
                    class="action-btn inactive-btn" 
                    title="Deactivate user" 
                    (click)="deactivateUser(user)"
                    *ngIf="canManageUser(user) && user.status === 'active'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                  <button 
                    class="action-btn reset-btn" 
                    title="Reset password" 
                    (click)="resetPassword(user)"
                    *ngIf="canManageUser(user)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredUsers.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <p>No users found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 1.5rem;
      background: var(--color-bg-primary);
      min-height: 100vh;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .btn-add-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: var(--color-button-bg);
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add-user:hover {
      background: var(--color-button-hover);
    }

    .btn-add-user svg {
      width: 1rem;
      height: 1rem;
    }

    .table-wrapper {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    thead {
      background: var(--color-bg-tertiary);
      border-bottom: 1px solid var(--color-border);
    }

    th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-border-light);
      color: var(--color-text-primary);
    }

    tbody tr:hover {
      background: var(--color-bg-tertiary);
    }

    tbody tr.status-suspended {
      opacity: 0.7;
      background: rgba(239, 68, 68, 0.05);
    }

    tbody tr.status-inactive {
      opacity: 0.6;
      background: rgba(107, 114, 128, 0.05);
    }

    .cell-name {
      font-weight: 500;
    }

    .cell-email {
      font-family: monospace;
      font-size: 0.8rem;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .role-badge[data-role="admin"] {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-badge[data-role="facility-manager"] {
      background: #e9d5ff;
      color: #7c3aed;
    }

    .role-badge[data-role="facility-staff"] {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-badge[data-status="active"] {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge[data-status="suspended"] {
      background: #fed7aa;
      color: #92400e;
    }

    .status-badge[data-status="inactive"] {
      background: #f3f4f6;
      color: #6b7280;
    }

    .cell-actions {
      width: 200px;
    }

    .actions-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-bg-tertiary);
    }

    .edit-btn {
      color: #3b82f6;
    }

    .edit-btn:hover {
      background: #3b82f6;
      color: white;
    }

    .suspend-btn {
      color: #f59e0b;
    }

    .suspend-btn:hover {
      background: #f59e0b;
      color: white;
    }

    .inactive-btn {
      color: #ef4444;
    }

    .inactive-btn:hover {
      background: #ef4444;
      color: white;
    }

    .reset-btn {
      color: #8b5cf6;
    }

    .reset-btn:hover {
      background: #8b5cf6;
      color: white;
    }

    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .users-header {
        flex-direction: column;
        gap: 1rem;
      }

      .users-table {
        font-size: 0.75rem;
      }

      th, td {
        padding: 0.5rem;
      }

      .actions-group {
        gap: 0.25rem;
      }

      .action-btn {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  currentUser: AuthUser | null = null;
  filteredUsers: UserWithStatus[] = [];

  // Demo users with status and last login
  private allUsers: UserWithStatus[] = [
    {
      id: 'user-admin-001',
      email: 'admin@rxgov.gov',
      name: 'Dr. Lisa Johnson',
      role: 'admin',
      permissions: ['all'],
      status: 'active',
      lastLogin: 'Today at 9:15 AM'
    },
    {
      id: 'user-mgr-001',
      email: 'manager@anchorage-ctc.org',
      name: 'Robert Chen',
      role: 'facility-manager',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center',
      permissions: ['view_facility_patients'],
      status: 'active',
      lastLogin: 'Today at 8:45 AM'
    },
    {
      id: 'user-mgr-002',
      email: 'manager2@cms-anc.org',
      name: 'Maria Rodriguez',
      role: 'facility-manager',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage',
      permissions: ['view_facility_patients'],
      status: 'active',
      lastLogin: 'Yesterday at 2:30 PM'
    },
    {
      id: 'user-staff-001',
      email: 'staff@anchorage-ctc.org',
      name: 'James Wilson',
      role: 'facility-staff',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center',
      permissions: ['view_facility_patients'],
      status: 'active',
      lastLogin: 'Today at 10:20 AM'
    },
    {
      id: 'user-staff-002',
      email: 'staff2@cms-anc.org',
      name: 'Emily Davis',
      role: 'facility-staff',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage',
      permissions: ['view_facility_patients'],
      status: 'suspended',
      lastLogin: '3 days ago'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
      // Facility staff can see users from their facility (but cannot manage them)
      this.filteredUsers = this.allUsers.filter(user =>
        user.facilityId === this.currentUser!.facilityId
      );
    }
  }

  canManageUser(user: UserWithStatus): boolean {
    if (!this.currentUser) return false;
    
    if (this.currentUser.role === 'admin') {
      return true;
    }
    
    if (this.currentUser.role === 'facility-manager') {
      // Facility managers can't manage other managers
      return user.role !== 'facility-manager';
    }
    
    return false; // Facility staff cannot manage any users
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

  editUser(user: UserWithStatus): void {
    console.log('Edit user:', user);
    alert(`Edit user: ${user.name}`);
  }

  suspendUser(user: UserWithStatus): void {
    console.log('Suspend user:', user);
    user.status = 'suspended';
    alert(`User ${user.name} has been suspended.`);
  }

  deactivateUser(user: UserWithStatus): void {
    console.log('Deactivate user:', user);
    user.status = 'inactive';
    alert(`User ${user.name} has been deactivated.`);
  }

  resetPassword(user: UserWithStatus): void {
    console.log('Reset password for:', user);
    alert(`Password reset link sent to ${user.email}`);
  }
}
