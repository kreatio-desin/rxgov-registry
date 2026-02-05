import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole, DemoAccount } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <!-- Background Gradient -->
      <div class="login-background"></div>

      <!-- Login Card -->
      <div class="login-card">
        <!-- Logo Section -->
        <div class="logo-section">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="logo-icon">
            <rect fill="var(--color-button-bg)" width="32" height="32" rx="6"/>
            <text x="50%" y="50%" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">Rx</text>
          </svg>
          <div class="logo-text">
            <h1>RXGOV Registry</h1>
            <p>Opioid Treatment Program Management</p>
          </div>
        </div>

        <!-- Role Selection -->
        <div class="role-selection" *ngIf="!selectedRole">
          <h2>Select Your Role</h2>
          <p>Choose your account type to continue</p>

          <div class="role-cards">
            <button class="role-card admin-card" (click)="selectRole('admin')">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <h3>Administrator</h3>
              <p>System-wide management and oversight</p>
            </button>

            <button class="role-card manager-card" (click)="selectRole('facility-manager')">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 12h4"></path>
                <path d="M10 8h4"></path>
                <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
              </svg>
              <h3>Facility Manager</h3>
              <p>Manage your facility and staff</p>
            </button>

            <button class="role-card staff-card" (click)="selectRole('facility-staff')">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h3>Facility Staff</h3>
              <p>Record doses and manage patients</p>
            </button>
          </div>
        </div>

        <!-- Account Selection -->
        <div class="account-selection" *ngIf="selectedRole && !selectedAccount">
          <button class="back-btn" (click)="selectedRole = null">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back
          </button>

          <h2>Select Demo Account</h2>
          <p>Choose an account for <strong>{{ getRoleDisplayName(selectedRole) }}</strong></p>

          <div class="account-list">
            <button 
              *ngFor="let account of demoAccounts" 
              class="account-card"
              (click)="selectAccount(account)"
            >
              <div class="account-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="account-info">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-email">{{ account.email }}</div>
                <div class="account-facility" *ngIf="account.facilityName">
                  {{ account.facilityName }}
                </div>
              </div>
              <div class="account-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <div class="login-form" *ngIf="selectedAccount">
          <button class="back-btn" (click)="selectedAccount = null">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back
          </button>

          <h2>Welcome, {{ selectedAccount.name }}</h2>
          <p>Sign in to your {{ getRoleDisplayName(selectedRole) }} account</p>

          <form (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                [(ngModel)]="loginEmail"
                [value]="selectedAccount.email"
                readonly
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                [(ngModel)]="loginPassword"
                [value]="selectedAccount.password"
                readonly
                class="form-input"
                placeholder="Enter password"
              />
              <small class="password-hint">Demo account: use {{ selectedAccount.password }}</small>
            </div>

            <button 
              type="submit" 
              class="login-btn"
              [disabled]="isLoading"
            >
              <span *ngIf="!isLoading">Sign In</span>
              <span *ngIf="isLoading">Signing In...</span>
            </button>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </form>

          <!-- Demo Info Box -->
          <div class="demo-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" x2="12" y1="8" y2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
            <span>This is a demo environment. All credentials are visible for testing purposes.</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>&copy; 2026 RXGOV Registry. All rights reserved.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--color-bg-primary);
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-button-bg) 100%);
      opacity: 0.05;
      pointer-events: none;
    }

    .login-card {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }

    .logo-text h1 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .logo-text p {
      margin: 0.25rem 0 0 0;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .role-selection,
    .account-selection,
    .login-form {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    > p {
      margin: 0 0 1.5rem 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .role-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (min-width: 640px) {
      .role-cards {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .role-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1rem;
      border: 2px solid var(--color-border);
      border-radius: 0.5rem;
      background: var(--color-bg-primary);
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .role-card:hover {
      border-color: var(--color-primary);
      background: var(--color-bg-tertiary);
    }

    .role-card svg {
      width: 2rem;
      height: 2rem;
    }

    .admin-card:hover svg {
      color: #3b82f6;
    }

    .manager-card:hover svg {
      color: #8b5cf6;
    }

    .staff-card:hover svg {
      color: #10b981;
    }

    .role-card h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .role-card p {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .account-selection {
      position: relative;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.5rem;
      margin-left: -0.5rem;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }

    .back-btn:hover {
      color: var(--color-button-hover);
    }

    .back-btn svg {
      width: 1rem;
      height: 1rem;
    }

    .account-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .account-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background: var(--color-bg-primary);
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .account-card:hover {
      border-color: var(--color-primary);
      background: var(--color-bg-tertiary);
    }

    .account-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-bg-tertiary);
      flex-shrink: 0;
      color: var(--color-primary);
    }

    .account-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .account-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text-primary);
    }

    .account-email {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .account-facility {
      font-size: 0.7rem;
      color: var(--color-text-tertiary);
      margin-top: 0.25rem;
    }

    .account-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }

    .account-arrow svg {
      width: 1rem;
      height: 1rem;
    }

    .login-form {
      position: relative;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-input {
      padding: 0.625rem;
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input:read-only {
      background: var(--color-bg-tertiary);
      cursor: not-allowed;
    }

    .password-hint {
      font-size: 0.7rem;
      color: var(--color-text-tertiary);
      margin-top: 0.25rem;
    }

    .login-btn {
      width: 100%;
      padding: 0.625rem;
      background: var(--color-button-bg);
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      background: var(--color-button-hover);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
      color: #dc2626;
      font-size: 0.875rem;
      text-align: center;
    }

    .demo-info {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #dbeafe;
      border: 1px solid #bfdbfe;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      color: #1e40af;
    }

    .demo-info svg {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .login-footer {
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }
  `]
})
export class LoginComponent implements OnInit {
  selectedRole: UserRole | null = null;
  selectedAccount: DemoAccount | null = null;
  demoAccounts: DemoAccount[] = [];
  
  loginEmail = '';
  loginPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/']);
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.demoAccounts = this.authService.getDemoAccountsByRole(role);
  }

  selectAccount(account: DemoAccount): void {
    this.selectedAccount = account;
    this.loginEmail = account.email;
    this.loginPassword = account.password;
  }

  getRoleDisplayName(role: UserRole | null): string {
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

  async handleLogin(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please enter your credentials';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.login(this.loginEmail, this.loginPassword);
      if (user) {
        // Navigate to dashboard based on role
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'An error occurred during login. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
