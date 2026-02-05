import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';

export type UserRole = 'admin' | 'facility-staff' | 'facility-manager';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
  permissions: string[];
}

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  facilityId?: string;
  facilityName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly STORAGE_KEY = 'auth_user';
  private readonly DEMO_ACCOUNTS: DemoAccount[] = [
    {
      email: 'admin@rxgov.gov',
      password: 'admin123',
      name: 'Dr. Lisa Johnson',
      role: 'admin'
    },
    {
      email: 'manager@anchorage-ctc.org',
      password: 'manager123',
      name: 'Robert Chen',
      role: 'facility-manager',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center'
    },
    {
      email: 'manager2@cms-anc.org',
      password: 'manager123',
      name: 'Maria Rodriguez',
      role: 'facility-manager',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage'
    },
    {
      email: 'staff@anchorage-ctc.org',
      password: 'staff123',
      name: 'James Wilson',
      role: 'facility-staff',
      facilityId: 'fac-act-001',
      facilityName: 'Anchorage Comprehensive Treatment Center'
    },
    {
      email: 'staff2@cms-anc.org',
      password: 'staff123',
      name: 'Emily Davis',
      role: 'facility-staff',
      facilityId: 'fac-cms-anc-001',
      facilityName: 'Community Medical Services – Anchorage'
    }
  ];

  constructor(private offlineStorage: OfflineStorageService) {
    this.restoreSession();
  }

  /**
   * Get all demo accounts (for login screen display)
   */
  getDemoAccounts(): DemoAccount[] {
    return this.DEMO_ACCOUNTS;
  }

  /**
   * Get demo accounts by role
   */
  getDemoAccountsByRole(role: UserRole): DemoAccount[] {
    return this.DEMO_ACCOUNTS.filter(account => account.role === role);
  }

  /**
   * Login with demo account
   */
  async login(email: string, password: string): Promise<AuthUser | null> {
    // Find the demo account
    const account = this.DEMO_ACCOUNTS.find(
      acc => acc.email === email && acc.password === password
    );

    if (!account) {
      return null;
    }

    // Create user object
    const user: AuthUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: account.email,
      name: account.name,
      role: account.role,
      facilityId: account.facilityId,
      facilityName: account.facilityName,
      permissions: this.getPermissionsByRole(account.role)
    };

    // Save to offline storage
    await this.offlineStorage.put('auth_session', user);

    // Update subjects
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    return user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.offlineStorage.delete('auth_session', 'current');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user role
   */
  getCurrentRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes('all');
  }

  /**
   * Get permissions for a specific role
   */
  private getPermissionsByRole(role: UserRole): string[] {
    switch (role) {
      case 'admin':
        return [
          'all',
          'view_all_facilities',
          'view_all_patients',
          'manage_users',
          'manage_facilities',
          'view_analytics',
          'manage_settings'
        ];
      case 'facility-manager':
        return [
          'view_facility_patients',
          'manage_facility_patients',
          'view_facility_staff',
          'manage_facility_staff',
          'approve_transfers',
          'view_facility_analytics',
          'view_facility_settings'
        ];
      case 'facility-staff':
        return [
          'view_facility_patients',
          'record_doses',
          'view_patient_history',
          'initiate_transfers',
          'view_prescriptions'
        ];
      default:
        return [];
    }
  }

  /**
   * Restore user session from storage
   */
  private async restoreSession(): Promise<void> {
    try {
      const user = await this.offlineStorage.get<AuthUser>('auth_session', 'current');
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.log('No active session found');
    }
  }
}
