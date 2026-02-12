import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService, SearchResult } from '../../core/services/patient.service';
import { OfflineStorageService } from '../../core/services/offline-storage.service';
import { SyncService } from '../../core/services/sync.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { SupportService, SupportTicket, Tutorial } from '../../core/services/support.service';
import {
  AccessibilityService,
  AccessibilitySettings,
  TextSize,
} from '../../core/services/accessibility.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('globalSearch') globalSearchInput!: ElementRef;

  searchQuery = '';
  searchResults: SearchResult[] = [];
  isOnline = navigator.onLine;
  syncStatus$: any;
  sidebarOpen = false;
  sidebarCollapsed = false;
  currentUser: AuthUser | null = null;

  // Help and Support Dialog
  showHelpDialog = false;
  activeTab: 'new' | 'tickets' | 'tutorials' = 'new';
  tickets: SupportTicket[] = [];
  tutorials: Tutorial[] = [];
  newTicket = {
    subject: '',
    priority: 'Medium - Minor Issue',
    description: '',
  };

  priorityOptions = [
    'Low - General question',
    'Medium - Minor Issue',
    'High - Major Functionality Broken',
    'Urgent - System Outage Critical',
  ];

  // Accessibility Dialog
  showAccessibilityDialog = false;
  accessibilitySettings = {
    highContrast: false,
    textSize: 'normal' as TextSize,
  };
  textSizeOptions: TextSize[] = ['normal', 'large', 'extra'];

  // User Menu
  showUserMenu = false;
  showNotificationsPanel = false;

  // Notifications
  unreadNotificationCount = 3;
  notifications: any[] = [
    {
      id: '1',
      title: 'Connection restored. Syncing data...',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      title: 'You are offline. Resilience Mode Active.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
    },
    {
      id: '3',
      title: 'New patient record created',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
    },
  ];

  constructor(
    private patientService: PatientService,
    private offlineStorage: OfflineStorageService,
    private syncService: SyncService,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private supportService: SupportService,
    private accessibilityService: AccessibilityService,
  ) {
    this.syncStatus$ = this.syncService.syncStatus$;
    this.setupKeyboardShortcuts();
    this.setupOnlineOfflineListeners();
  }

  ngOnInit(): void {
    // Load current user
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Load accessibility settings
    this.accessibilityService.settings$.subscribe((settings) => {
      this.accessibilitySettings = settings;
    });
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
    this.sidebarCollapsed = !this.sidebarCollapsed;
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
      const result = await this.patientService.searchPatient(firstName, lastName, '', '', '');

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
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

  // User Menu Methods
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  navigateToProfile(): void {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  // Notifications Methods
  toggleNotificationsPanel(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
  }

  closeNotificationsPanel(): void {
    this.showNotificationsPanel = false;
  }

  markAllRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.unreadNotificationCount = 0;
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.unreadNotificationCount = 0;
  }

  removeNotification(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification && !notification.read) {
      this.unreadNotificationCount = Math.max(0, this.unreadNotificationCount - 1);
    }
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'bi bi-check-circle text-green-600';
      case 'error':
        return 'bi bi-exclamation-circle text-red-600';
      case 'warning':
        return 'bi bi-exclamation-triangle text-yellow-600';
      case 'info':
      default:
        return 'bi bi-info-circle text-blue-600';
    }
  }

  // Help and Support Methods
  openHelpDialog(): void {
    this.showHelpDialog = true;
    this.activeTab = 'new';
    this.loadTicketsAndTutorials();
  }

  closeHelpDialog(): void {
    this.showHelpDialog = false;
    this.resetForm();
  }

  private loadTicketsAndTutorials(): void {
    this.tickets = this.supportService.getTickets();
    this.tutorials = this.supportService.getTutorials();
  }

  submitTicket(): void {
    if (!this.newTicket.subject.trim() || !this.newTicket.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    this.supportService.submitTicket(
      this.newTicket.subject,
      this.newTicket.description,
      this.newTicket.priority,
    );

    this.resetForm();
    this.activeTab = 'tickets';
    this.loadTicketsAndTutorials();
  }

  startTutorial(tutorial: Tutorial): void {
    // Mark tutorial as completed for now
    this.supportService.markTutorialCompleted(tutorial.id);
    this.loadTicketsAndTutorials();

    // In a full implementation, this would launch an interactive overlay
    // with step-by-step guidance highlighting specific UI elements
    console.log('Starting tutorial:', tutorial.title);
    alert(`Tutorial "${tutorial.title}" started. Steps: ${tutorial.steps.length}`);
  }

  private resetForm(): void {
    this.newTicket = {
      subject: '',
      priority: 'Medium - Minor Issue',
      description: '',
    };
    this.activeTab = 'new';
  }

  // Accessibility Methods
  openAccessibilityDialog(): void {
    this.showAccessibilityDialog = true;
    this.accessibilitySettings = this.accessibilityService.getSettings();
  }

  closeAccessibilityDialog(): void {
    this.showAccessibilityDialog = false;
  }

  toggleHighContrast(): void {
    this.accessibilityService.toggleHighContrast();
  }

  setTextSize(size: TextSize): void {
    this.accessibilityService.setTextSize(size);
  }

  getSizeLabel(size: TextSize): string {
    switch (size) {
      case 'normal':
        return 'Normal';
      case 'large':
        return 'Large';
      case 'extra':
        return 'Extra';
      default:
        return 'Normal';
    }
  }
}
