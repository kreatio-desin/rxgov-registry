import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, SearchResult } from '../core/services/patient.service';
import { OfflineStorageService } from '../core/services/offline-storage.service';
import { SyncService } from '../core/services/sync.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  template: `
    <div class="app-container">
      <!-- Header with Global Search -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <i class="bi bi-hospital"></i>
            <span>RxGov Registry</span>
          </div>
          
          <div class="search-container">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input
                #globalSearch
                type="text"
                placeholder="Search patient (Ctrl+J)..."
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (blur)="closeSearchResults()"
                class="search-input"
              />
              
              <!-- Search Results Dropdown -->
              <div *ngIf="searchResults.length > 0" class="search-results">
                <div
                  *ngFor="let result of searchResults"
                  class="search-result-item"
                  (click)="selectSearchResult(result)"
                >
                  <div class="result-header">
                    <span *ngIf="result.patient" class="patient-name">
                      {{ result.patient.firstName }} {{ result.patient.lastName }}
                    </span>
                    <span *ngIf="!result.patient && result.type === 'conditional-match'" class="conditional-badge">
                      Potential Match Found
                    </span>
                  </div>
                  <div *ngIf="result.patient" class="result-meta">
                    <span class="registry-id">{{ result.patient.registryId }}</span>
                    <span class="status" [class]="result.patient.currentEnrollment?.status">
                      {{ result.patient.currentEnrollment?.status || 'No Enrollment' }}
                    </span>
                  </div>
                  <div *ngIf="result.type === 'conditional-match'" class="result-meta warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    Consent required to view details
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <div class="sync-status" *ngIf="(syncStatus$ | async) as sync">
              <i 
                [class]="sync.isSyncing ? 'bi bi-arrow-repeat rotating' : 'bi bi-check-circle'"
                [title]="sync.lastSync ? 'Last sync: ' + (sync.lastSync | date:'short') : 'Not synced'"
              ></i>
              <span *ngIf="sync.pendingItems > 0" class="pending-badge">{{ sync.pendingItems }}</span>
            </div>
            
            <div class="online-status">
              <i [class]="isOnline ? 'bi bi-wifi' : 'bi bi-wifi-off offline'"></i>
              <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Navigation -->
      <nav class="app-nav">
        <div class="nav-content">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <i class="bi bi-house"></i>
            Dashboard
          </a>
          <a routerLink="/patient" routerLinkActive="active">
            <i class="bi bi-person"></i>
            Patients
          </a>
          <a routerLink="/facilities" routerLinkActive="active">
            <i class="bi bi-building"></i>
            Facilities
          </a>
          <a routerLink="/emergency" routerLinkActive="active">
            <i class="bi bi-exclamation-circle"></i>
            Emergency
          </a>
          <a routerLink="/mmu" routerLinkActive="active">
            <i class="bi bi-van-front"></i>
            MMU
          </a>
          <a routerLink="/compliance" routerLinkActive="active">
            <i class="bi bi-shield-check"></i>
            Compliance
          </a>
          <a routerLink="/settings" routerLinkActive="active">
            <i class="bi bi-gear"></i>
            Settings
          </a>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8f9fa;
    }

    .app-header {
      background: white;
      border-bottom: 1px solid #dee2e6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 0;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      color: #0c5caa;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .logo i {
      font-size: 2rem;
    }

    .search-container {
      flex: 1;
      max-width: 500px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 0.5rem 1rem;
    }

    .search-box i {
      color: #6c757d;
      margin-right: 0.5rem;
    }

    .search-input {
      border: none;
      background: transparent;
      flex: 1;
      padding: 0.5rem;
      outline: none;
      font-size: 0.9rem;

      &::placeholder {
        color: #adb5bd;
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #dee2e6;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1001;
    }

    .search-result-item {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f9fa;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .patient-name {
      font-weight: bold;
      color: #333;
    }

    .conditional-badge {
      background: #fff3cd;
      color: #856404;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: bold;
    }

    .result-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #6c757d;

      &.warning {
        color: #856404;
        gap: 0.5rem;
        align-items: center;
      }
    }

    .registry-id {
      font-family: monospace;
      color: #0c5caa;
    }

    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-weight: bold;
      text-transform: capitalize;

      &.active {
        background: #d4edda;
        color: #155724;
      }

      &.inactive {
        background: #e2e3e5;
        color: #383d41;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-shrink: 0;
    }

    .sync-status {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      i {
        font-size: 1.25rem;
        color: #28a745;

        &.rotating {
          animation: spin 2s linear infinite;
          color: #0c5caa;
        }
      }

      .pending-badge {
        position: absolute;
        top: -8px;
        right: -12px;
        background: #dc3545;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 0.75rem;
        font-weight: bold;
      }
    }

    .online-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #6c757d;

      i {
        font-size: 1.25rem;
        color: #28a745;

        &.offline {
          color: #dc3545;
        }
      }
    }

    .app-nav {
      background: white;
      border-bottom: 1px solid #dee2e6;
      padding: 0;
      position: sticky;
      top: 70px;
      z-index: 999;
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      gap: 0;

      a {
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6c757d;
        text-decoration: none;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        white-space: nowrap;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          color: #0c5caa;
          background-color: #f8f9fa;
        }

        &.active {
          color: #0c5caa;
          border-bottom-color: #0c5caa;
        }
      }
    }

    .app-main {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
      }

      .search-container {
        order: 3;
        flex-basis: 100%;
      }

      .logo {
        font-size: 1.25rem;
      }

      .logo span {
        display: none;
      }

      .nav-content {
        overflow-x: auto;
      }

      .nav-content a {
        padding: 1rem;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('globalSearch') globalSearchInput!: ElementRef;

  searchQuery = '';
  searchResults: SearchResult[] = [];
  isOnline = navigator.onLine;
  syncStatus$ = this.syncService.syncStatus$;

  constructor(
    private patientService: PatientService,
    private offlineStorage: OfflineStorageService,
    private syncService: SyncService,
    private router: Router
  ) {
    this.setupKeyboardShortcuts();
    this.setupOnlineOfflineListeners();
  }

  ngOnInit(): void {
    // Initialize any needed data
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl+J for global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        this.globalSearchInput?.nativeElement?.focus();
      }
    });
  }

  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Offline - using cached data');
    });
  }

  async onSearchInput(): Promise<void> {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    // Simple search by patient name
    const parts = this.searchQuery.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    try {
      const result = await this.patientService.searchPatient(
        firstName,
        lastName,
        '', // dateOfBirth - could be parsed from search
        '', // ssn
        ''
      );

      this.searchResults = result.type !== 'no-match' ? [result] : [];
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults = [];
    }
  }

  async selectSearchResult(result: SearchResult): Promise<void> {
    if (result.type === 'conditional-match') {
      // Navigate to attestation/break glass workflow
      this.router.navigate(['/emergency'], { queryParams: { hash: result.hash } });
    } else if (result.type === 'unconditional-match' && result.patient) {
      // Navigate to patient detail
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
