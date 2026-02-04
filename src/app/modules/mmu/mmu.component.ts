import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RouteStop {
  id: string;
  name: string;
  address: string;
}

interface Encounter {
  id: string;
  patientName: string;
  time: string;
  service: string;
}

interface AvailableStop extends RouteStop {
  // Extends RouteStop with same properties
}

@Component({
  selector: 'app-mmu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mmu-wrapper">
      <!-- Header -->
      <div class="mmu-header">
        <div class="header-title">
          <i class="bi bi-bus"></i>
          <div>
            <h2>Mobile Medication Unit (MMU)</h2>
            <p>Manage mobile routes, track stops, and log patient encounters offline.</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="mmu-content">
        <!-- Left Panel - Route Management -->
        <div class="left-panel">
          <!-- Current Route Section -->
          <div class="route-card">
            <div class="card-header">Current Route</div>
            <div class="card-body">
              <div class="form-group">
                <label>Select Unit</label>
                <select [(ngModel)]="selectedUnit" class="form-select">
                  <option value="unit1">Anchorage Mobile Unit 1</option>
                  <option value="unit2">Fairbanks Mobile Unit 2</option>
                  <option value="unit3">Juneau Mobile Unit 3</option>
                </select>
              </div>

              <!-- Route Stops -->
              <div class="route-stops-section">
                <div class="stops-header">
                  <label>Route Stops</label>
                </div>
                <div class="stops-list">
                  <div *ngFor="let stop of routeStops" class="stop-item">
                    <div class="stop-info">
                      <i class="bi bi-geo-alt"></i>
                      <div class="stop-details">
                        <div class="stop-name">{{ stop.name }}</div>
                        <div class="stop-address">{{ stop.address }}</div>
                      </div>
                    </div>
                    <button class="btn-remove" (click)="removeStop(stop.id)" title="Remove stop">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="add-stop-container">
                  <button #addStopBtn class="btn-add-stop" (click)="openAddStopDialog()">
                    <i class="bi bi-plus"></i>
                    Add Stop
                  </button>

                  <!-- Add Stop Dropdown -->
                  <div *ngIf="showAddStopDialog" class="dropdown-wrapper" (click)="$event.stopPropagation()">
                    <div class="dropdown-content">
                      <!-- Search Step -->
                      <div *ngIf="!showCreateNewForm" class="dropdown-inner">
                        <div class="dropdown-header">
                          <i class="bi bi-search"></i>
                          <input
                            type="text"
                            [(ngModel)]="searchQuery"
                            (input)="searchStops()"
                            placeholder="Search existing stops..."
                            class="dropdown-search"
                            autofocus
                          />
                        </div>

                        <div class="dropdown-list">
                          <!-- Recent Stops -->
                          <div *ngIf="searchQuery === '' && recentStops.length > 0">
                            <div class="list-group-title">Recent Stops</div>
                            <button
                              *ngFor="let stop of recentStops"
                              class="list-item"
                              (click)="selectStop(stop)"
                            >
                              <i class="bi bi-geo-alt"></i>
                              <div class="list-item-content">
                                <div class="list-item-name">{{ stop.name }}</div>
                                <div class="list-item-address">{{ stop.address }}</div>
                              </div>
                            </button>
                          </div>

                          <!-- Search Results -->
                          <div *ngIf="searchQuery !== ''">
                            <div *ngIf="filteredStops.length > 0">
                              <button
                                *ngFor="let stop of filteredStops"
                                class="list-item"
                                (click)="selectStop(stop)"
                              >
                                <i class="bi bi-geo-alt"></i>
                                <div class="list-item-content">
                                  <div class="list-item-name">{{ stop.name }}</div>
                                  <div class="list-item-address">{{ stop.address }}</div>
                                </div>
                              </button>
                            </div>

                            <!-- No Results - Create New -->
                            <div *ngIf="filteredStops.length === 0" class="no-results-container">
                              <p class="no-results-text">No existing stop found.</p>
                              <button class="btn-create-stop" (click)="startCreateNewStop()">
                                Create "{{ searchQuery }}"
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Create New Stop Form -->
                      <div *ngIf="showCreateNewForm" class="dropdown-inner form-mode">
                        <div class="form-title">
                          <button class="btn-back" (click)="backToSearch()">
                            <i class="bi bi-chevron-left"></i>
                          </button>
                          <span>Add Stop</span>
                        </div>

                        <div class="form-group-inline">
                          <label>Stop Name</label>
                          <input
                            type="text"
                            [(ngModel)]="newStopName"
                            placeholder="Enter stop name"
                            class="form-input-inline"
                          />
                        </div>
                        <div class="form-group-inline">
                          <label>Address</label>
                          <input
                            type="text"
                            [(ngModel)]="newStopAddress"
                            placeholder="Enter address"
                            class="form-input-inline"
                          />
                        </div>

                        <button class="btn-add-stop-save" (click)="saveNewStop()">
                          Add Stop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Encounters -->
          <div class="encounters-card">
            <div class="card-header">
              <i class="bi bi-people"></i>
              Today's Encounters
            </div>
            <div class="card-body">
              <div *ngIf="todayEncounters.length === 0" class="empty-state">
                No encounters logged today.
              </div>
              <div *ngIf="todayEncounters.length > 0" class="encounters-list">
                <div *ngFor="let encounter of todayEncounters" class="encounter-item">
                  <div class="encounter-time">{{ encounter.time }}</div>
                  <div class="encounter-details">
                    <div class="encounter-name">{{ encounter.patientName }}</div>
                    <div class="encounter-service">{{ encounter.service }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Map/Details -->
        <div class="right-panel">
          <div class="map-placeholder">
            <i class="bi bi-geo-alt"></i>
            <h3>No Stop Selected</h3>
            <p>Please select an active stop from the route list to begin logging encounters.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mmu-wrapper {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 120px);
      gap: 1rem;
      padding: 0;
    }

    .mmu-header {
      padding: 0 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;

      i {
        font-size: 1.5rem;
        color: #4f46e5;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
      }

      p {
        margin: 0.25rem 0 0 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .mmu-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
      padding: 1rem;
      flex: 1;
      min-height: 0;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
    }

    .route-card,
    .encounters-card {
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .route-card {
      flex: 0 0 auto;
      max-height: 55%;
    }

    .encounters-card {
      flex: 1;
      min-height: 0;
    }

    .card-header {
      padding: 0.75rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-body {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #374151;
    }

    .form-select {
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      background-color: #f3f4f6;
      height: 1.75rem;
      overflow: visible;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .route-stops-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
      min-height: 0;
    }

    .stops-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stops-header label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #374151;
    }

    .stops-list {
      display: grid;
      gap: 0.375rem;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .stop-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
      border: 1px solid #d1d5db;
      background: #fafbfc;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f0f1f3;
      }
    }

    .stop-info {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      flex: 1;
      min-width: 0;

      i {
        font-size: 0.625rem;
        margin-top: 0.125rem;
        color: #6b7280;
        flex-shrink: 0;
      }
    }

    .stop-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .stop-name {
      font-size: 0.625rem;
      font-weight: 600;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stop-address {
      font-size: 0.5rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-remove {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;

      .stop-item:hover & {
        opacity: 1;
      }

      i {
        font-size: 0.625rem;
        color: #6b7280;

        &:hover {
          color: #dc2626;
        }
      }
    }

    .btn-add-stop {
      width: 100%;
      padding: 0.5rem;
      border: 1px dashed #cbd5e1;
      border-radius: 0.25rem;
      background: transparent;
      color: #64748b;
      font-size: 0.7rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      transition: all 0.2s;
      margin-top: 0.25rem;

      &:hover {
        border-color: #94a3b8;
        color: #1e293b;
      }

      i {
        font-size: 0.75rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 1rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .encounters-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
    }

    .encounter-item {
      padding: 0.5rem;
      border-radius: 0.25rem;
      background: #f9fafb;
      border-left: 2px solid #3b82f6;
    }

    .encounter-time {
      font-size: 0.625rem;
      font-weight: 600;
      color: #0c5caa;
    }

    .encounter-details {
      margin-top: 0.25rem;
    }

    .encounter-name {
      font-size: 0.7rem;
      font-weight: 500;
      color: #1f2937;
    }

    .encounter-service {
      font-size: 0.625rem;
      color: #6b7280;
    }

    .right-panel {
      background: white;
      border-radius: 0.5rem;
      border: 2px dashed #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      min-height: 0;
    }

    .map-placeholder {
      text-align: center;

      i {
        font-size: 2.5rem;
        color: #d1d5db;
        margin-bottom: 0.75rem;
        opacity: 0.3;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
      }

      p {
        margin: 0;
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .btn-primary {
      background: #0c5caa;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #0a4a85;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f9fafb;
      }
    }

    /* Modal Dialog Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-dialog {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      width: 90%;
      max-width: 28rem;
      max-height: 80vh;
      z-index: 1001;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      opacity: 0.6;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      i {
        font-size: 1.25rem;
        color: #6b7280;
      }
    }

    .modal-body {
      padding: 1rem 1.5rem;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;

      button {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
      }
    }

    .search-group {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background-color: #f9fafb;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #0c5caa;
        background-color: white;
        box-shadow: 0 0 0 3px rgba(12, 92, 170, 0.1);
      }
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .results-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .results-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      padding: 0 0 0.25rem 0;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 16rem;
      overflow-y: auto;
    }

    .result-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;

      &:hover {
        border-color: #0c5caa;
        background: #f0f9ff;
      }

      i {
        flex-shrink: 0;
        color: #0c5caa;
        font-size: 1rem;
        margin-top: 0.125rem;
      }
    }

    .result-content {
      flex: 1;
      min-width: 0;
    }

    .result-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-address {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-results {
      padding: 1.5rem 1rem;
      text-align: center;
      border: 1px dashed #e5e7eb;
      border-radius: 0.375rem;

      p {
        margin: 0 0 0.75rem 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .btn-create {
      width: 100%;
      padding: 0.75rem;
      background: #0c5caa;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #0a4a85;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background-color: #f9fafb;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #0c5caa;
        background-color: white;
        box-shadow: 0 0 0 3px rgba(12, 92, 170, 0.1);
      }
    }
  `]
})
export class MMUComponent implements OnInit {
  selectedUnit = 'unit1';

  routeStops: RouteStop[] = [
    {
      id: '1',
      name: 'Downtown Shelter',
      address: '100 E 4th Ave'
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd'
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street'
    }
  ];

  // Available stops database (for search)
  availableStops: AvailableStop[] = [
    {
      id: '1',
      name: 'Downtown Shelter',
      address: '100 E 4th Ave'
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd'
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street'
    },
    {
      id: '4',
      name: 'Fairview Rec Center',
      address: '1121 E 10th Ave'
    },
    {
      id: '5',
      name: 'Eldercare Center',
      address: '456 Park Ave'
    },
    {
      id: '6',
      name: 'Community Clinic',
      address: '789 Market St'
    },
    {
      id: '7',
      name: 'Youth Services',
      address: '321 Main St'
    }
  ];

  todayEncounters: Encounter[] = [];

  // Dialog state
  showAddStopDialog = false;
  showCreateNewForm = false;
  searchQuery = '';
  filteredStops: AvailableStop[] = [];
  recentStops: AvailableStop[] = [];
  newStopName = '';
  newStopAddress = '';

  ngOnInit(): void {
    // Load today's encounters
    this.recentStops = this.availableStops.slice(0, 3);
  }

  openAddStopDialog(): void {
    this.showAddStopDialog = true;
    this.showCreateNewForm = false;
    this.searchQuery = '';
    this.newStopName = '';
    this.newStopAddress = '';
    this.filteredStops = [];
  }

  closeAddStopDialog(): void {
    this.showAddStopDialog = false;
    this.showCreateNewForm = false;
    this.searchQuery = '';
    this.newStopName = '';
    this.newStopAddress = '';
  }

  searchStops(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredStops = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredStops = this.availableStops.filter(stop =>
      stop.name.toLowerCase().includes(query) ||
      stop.address.toLowerCase().includes(query)
    );
  }

  selectStop(stop: AvailableStop): void {
    // Check if stop is already in route
    const existingStop = this.routeStops.find(s => s.id === stop.id);
    if (existingStop) {
      // Stop already added, just close dialog
      this.closeAddStopDialog();
      return;
    }

    // Add stop to route
    this.routeStops.push({
      id: stop.id,
      name: stop.name,
      address: stop.address
    });

    this.closeAddStopDialog();
  }

  startCreateNewStop(): void {
    this.newStopName = this.searchQuery;
    this.showCreateNewForm = true;
  }

  saveNewStop(): void {
    if (this.newStopName.trim() && this.newStopAddress.trim()) {
      // Create new stop with unique ID
      const newStop: RouteStop = {
        id: Math.random().toString(36).substr(2, 9),
        name: this.newStopName,
        address: this.newStopAddress
      };

      // Add to route stops
      this.routeStops.push(newStop);

      // Also add to available stops for future searches
      this.availableStops.push({
        id: newStop.id,
        name: newStop.name,
        address: newStop.address
      });

      this.closeAddStopDialog();
    }
  }

  removeStop(stopId: string): void {
    this.routeStops = this.routeStops.filter(stop => stop.id !== stopId);
  }
}
