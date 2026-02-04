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
                <button class="btn-add-stop" (click)="addStop()">
                  <i class="bi bi-plus"></i>
                  Add Stop
                </button>
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
      name: 'Fairview Rec Center',
      address: '1121 E 10th Ave'
    },
    {
      id: '3',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd'
    }
  ];

  todayEncounters: Encounter[] = [];

  ngOnInit(): void {
    // Load today's encounters
  }

  addStop(): void {
    // Open dialog to add new stop
    console.log('Add stop functionality');
  }

  removeStop(stopId: string): void {
    this.routeStops = this.routeStops.filter(stop => stop.id !== stopId);
  }
}
