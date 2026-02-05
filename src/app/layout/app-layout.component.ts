import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, SearchResult } from '../core/services/patient.service';
import { OfflineStorageService } from '../core/services/offline-storage.service';
import { SyncService } from '../core/services/sync.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <!-- Logo -->
          <div class="logo-section">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%230066cc' width='32' height='32' rx='6'/%3E%3Ctext x='50%25' y='50%25' font-size='18' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ERx%3C/text%3E%3C/svg%3E" alt="RxGov" class="logo-img">
            <div class="logo-text">
              <div class="logo-title">REGISTRY</div>
              <div class="logo-subtitle">My Clinic</div>
            </div>
          </div>

          <!-- Navigation Items -->
          <nav class="nav-menu">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
               class="nav-item" title="My Clinic">
              <i class="bi bi-layout-dashboard"></i>
              <span class="nav-label">My Clinic</span>
            </a>
            <a routerLink="/mmu" routerLinkActive="active"
               class="nav-item" title="Mobile Unit">
              <i class="bi bi-bus"></i>
              <span class="nav-label">Mobile Unit</span>
            </a>
            <a routerLink="/facilities" routerLinkActive="active"
               class="nav-item" title="Facilities">
              <i class="bi bi-building-2"></i>
              <span class="nav-label">Facilities</span>
            </a>
            <a routerLink="/compliance" routerLinkActive="active"
               class="nav-item" title="Reports">
              <i class="bi bi-file-earmark-bar-graph"></i>
              <span class="nav-label">Reports</span>
            </a>
          </nav>

          <!-- Bottom Navigation -->
          <div class="nav-bottom">
            <div class="nav-divider"></div>
            <button class="nav-item" title="Theme" (click)="toggleTheme()">
              <i class="bi bi-circle-half"></i>
              <span class="nav-label">Theme</span>
            </button>
            <button class="nav-item" title="Accessibility">
              <i class="bi bi-person-standing"></i>
              <span class="nav-label">Accessibility</span>
            </button>
            <button class="nav-item" title="Users">
              <i class="bi bi-people"></i>
              <span class="nav-label">Users</span>
            </button>
            <button class="nav-item" title="Offline Sync">
              <i class="bi bi-arrow-repeat"></i>
              <span class="nav-label">Offline Sync</span>
            </button>
            <button class="nav-item nav-logout" title="Sign Out">
              <i class="bi bi-box-arrow-right"></i>
              <span class="nav-label">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <!-- Header -->
        <header class="main-header">
          <div class="header-left">
            <button class="menu-toggle" (click)="toggleSidebar()">
              <i class="bi bi-list"></i>
            </button>
            <h1 class="page-title">My Clinic Dashboard</h1>
          </div>

          <div class="header-center">
            <div class="search-container">
              <i class="bi bi-search"></i>
              <input 
                #globalSearch
                type="text" 
                placeholder="Search Registry..." 
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (blur)="closeSearchResults()"
                class="search-input"
              />
              <kbd class="search-kbd">⌘J</kbd>

              <!-- Search Results -->
              <div *ngIf="searchResults.length > 0" class="search-results">
                <div *ngFor="let result of searchResults" 
                     class="search-result-item"
                     (click)="selectSearchResult(result)">
                  <span *ngIf="result.patient" class="result-name">
                    {{ result.patient.firstName }} {{ result.patient.lastName }}
                  </span>
                  <span *ngIf="!result.patient" class="result-name">
                    Potential Match Found
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="header-right">
            <div class="facility-info">
              <div class="status-indicator"></div>
              <div class="facility-text">
                <div class="facility-name hidden lg:block">Anchorage Comprehensive Treatment Center</div>
                <div class="facility-name-short lg:hidden">Anchorage Comprehens</div>
                <div class="user-name">Liam Williams</div>
              </div>
            </div>

            <button class="notification-btn">
              <i class="bi bi-bell"></i>
              <span class="notification-badge">2</span>
            </button>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Floating Help Button -->
      <button class="help-button" title="Help and Support">
        <i class="bi bi-life-preserver"></i>
      </button>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: grid;
      grid-template-columns: 200px 1fr;
      min-height: 100vh;
      background-color: #f8f9fa;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar Styles */
    .sidebar {
      background: white;
      border-right: 1px solid #e5e7eb;
      width: 200px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      height: 100%;
      padding: 0;
    }

    .logo-section {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
      padding: 0 12px;
      gap: 8px;
    }

    .logo-img {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      gap: 0;
      flex: 1;
      min-width: 0;
    }

    .logo-title {
      font-size: 10px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: 1px;
      text-transform: uppercase;
      line-height: 1;
    }

    .logo-subtitle {
      font-size: 11px;
      color: #6b7280;
      line-height: 1;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      flex: 1;
    }

    .nav-item {
      width: 100%;
      height: auto;
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 6px;
      color: #6b7280;
      border: none;
      background: none;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 18px;
      position: relative;
      padding: 8px 12px;
      text-decoration: none;

      i {
        font-size: 18px;
        flex-shrink: 0;
      }

      &:hover {
        background: #f3f4f6;
        color: #0066cc;
      }

      &.active {
        background: #dbeafe;
        color: #0066cc;
      }
    }

    .nav-label {
      font-size: 13px;
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .nav-bottom {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border-top: 1px solid #e5e7eb;

      .nav-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 4px 0;
      }

      .nav-item {
        width: 100%;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 12px;

        &.nav-logout {
          color: #ef4444;

          &:hover {
            background: #fee2e2;
            color: #dc2626;
          }
        }
      }
    }

    /* Main Wrapper */
    .main-wrapper {
      grid-column: 2;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Header Styles */
    .main-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 24px;
      position: sticky;
      top: 0;
      z-index: 500;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: 1px solid #e5e7eb;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      color: #374151;
      font-size: 18px;

      @media (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      white-space: nowrap;
      display: none;

      @media (max-width: 1024px) {
        display: none;
      }

      @media (min-width: 1024px) {
        display: block;
      }
    }

    .header-center {
      flex: 1;
      max-width: 500px;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 12px;
      gap: 8px;

      i {
        color: #6b7280;
        font-size: 16px;
      }
    }

    .search-input {
      border: none;
      background: none;
      outline: none;
      flex: 1;
      font-size: 14px;
      color: #1f2937;

      &::placeholder {
        color: #9ca3af;
      }
    }

    .search-kbd {
      font-size: 11px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      border: 1px solid #e5e7eb;
      display: none;

      @media (min-width: 640px) {
        display: block;
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .search-result-item {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f9fafb;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .result-name {
      color: #1f2937;
      font-weight: 500;
      font-size: 14px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .facility-info {
      display: flex;
      align-items: center;
      gap: 8px;

      @media (max-width: 640px) {
        display: none;
      }
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      title: 'Clinic Online';
    }

    .facility-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .facility-name {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.2;
    }

    .facility-name-short {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.2;
    }

    .user-name {
      font-size: 12px;
      color: #9ca3af;
      font-weight: 500;
    }

    .notification-btn {
      position: relative;
      background: none;
      border: none;
      color: #6b7280;
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #374151;
      }
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    /* Help Button */
    .help-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #0066cc;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
      transition: all 0.2s;
      z-index: 999;

      &:hover {
        background: #0052a3;
        box-shadow: 0 6px 16px rgba(0, 102, 204, 0.4);
        transform: scale(1.05);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .layout-wrapper {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }

      .main-wrapper {
        grid-column: 1;
      }

      .main-header {
        padding: 0 16px;
        gap: 12px;
      }

      .header-center {
        max-width: none;
      }

      .page-title {
        display: block;
      }

      .main-content {
        padding: 16px;
      }

      .help-button {
        bottom: 16px;
        right: 16px;
        width: 44px;
        height: 44px;
        font-size: 20px;
      }
    }

    @media (max-width: 480px) {
      .main-header {
        flex-direction: column;
        height: auto;
        padding: 12px 16px;
        gap: 12px;
      }

      .header-left {
        width: 100%;
        justify-content: space-between;
      }

      .page-title {
        font-size: 16px;
      }

      .header-center {
        width: 100%;
      }

      .header-right {
        width: 100%;
        justify-content: flex-end;
        gap: 12px;
      }

      .search-kbd {
        display: none;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('globalSearch') globalSearchInput!: ElementRef;

  searchQuery = '';
  searchResults: SearchResult[] = [];
  isOnline = navigator.onLine;
  syncStatus$: any;
  sidebarOpen = false;

  constructor(
    private patientService: PatientService,
    private offlineStorage: OfflineStorageService,
    private syncService: SyncService,
    private router: Router
  ) {
    this.syncStatus$ = this.syncService.syncStatus$;
    this.setupKeyboardShortcuts();
    this.setupOnlineOfflineListeners();
  }

  ngOnInit(): void {
    // Initialize
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        this.globalSearchInput?.nativeElement?.focus();
      }
    });
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  async onSearchInput(): Promise<void> {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    const parts = this.searchQuery.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    try {
      const result = await this.patientService.searchPatient(
        firstName,
        lastName,
        '',
        '',
        ''
      );

      this.searchResults = result.type !== 'no-match' ? [result] : [];
    } catch (error) {
      this.searchResults = [];
    }
  }

  async selectSearchResult(result: SearchResult): Promise<void> {
    if (result.type === 'conditional-match') {
      this.router.navigate(['/emergency'], { queryParams: { hash: result.hash } });
    } else if (result.type === 'unconditional-match' && result.patient) {
      this.patientService.setCurrentPatient(result.patient);
      this.router.navigate(['/patient', result.patient.id]);
    }

    this.searchQuery = '';
    this.searchResults = [];
  }

  closeSearchResults(): void {
    setTimeout(() => {
      this.searchResults = [];
    }, 200);
  }
}
