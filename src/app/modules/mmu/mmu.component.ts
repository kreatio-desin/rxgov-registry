import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface RouteStop {
  id: string;
  name: string;
  address: string;
  facilityId: string;
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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  ssn: string;
  facilityId: string;
  isRestricted: boolean;
}

interface PatientMatch {
  patient: Patient;
  isRestricted: boolean;
}

interface DoseAdministration {
  medicationName: string;
  dose: string;
  unit: string;
  route: string;
  site: string;
  time: string;
  notes: string;
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
                  <div *ngFor="let stop of routeStops"
                       class="stop-item"
                       [class.selected]="selectedStopId === stop.id"
                       (click)="selectStopForPatientQueue(stop)">
                    <div class="stop-info">
                      <i class="bi bi-geo-alt"></i>
                      <div class="stop-details">
                        <div class="stop-name">{{ stop.name }}</div>
                        <div class="stop-address">{{ stop.address }}</div>
                      </div>
                    </div>
                    <button class="btn-remove" (click)="removeStop(stop.id, $event)" title="Remove stop">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="add-stop-container">
                  <button class="btn-add-stop" (click)="openAddStopDialog()">
                    <i class="bi bi-plus"></i>
                    Add Stop
                  </button>
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

        <!-- Add Stop Dropdown (Moved outside of scrollable container) -->
        <div *ngIf="showAddStopDialog" class="dropdown-content dropdown-outside">
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
                        <div *ngIf="searchQuery === '' && recentStops.length > 0">
                          <div class="list-group-title">Recent Stops</div>
                          <button *ngFor="let stop of recentStops" class="list-item" (click)="selectStop(stop)">
                            <i class="bi bi-geo-alt"></i>
                            <div class="list-item-content">
                              <div class="list-item-name">{{ stop.name }}</div>
                              <div class="list-item-address">{{ stop.address }}</div>
                            </div>
                          </button>
                        </div>
                        <div *ngIf="searchQuery !== ''">
                          <div *ngIf="filteredStops.length > 0">
                            <button *ngFor="let stop of filteredStops" class="list-item" (click)="selectStop(stop)">
                              <i class="bi bi-geo-alt"></i>
                              <div class="list-item-content">
                                <div class="list-item-name">{{ stop.name }}</div>
                                <div class="list-item-address">{{ stop.address }}</div>
                              </div>
                            </button>
                          </div>
                          <div *ngIf="filteredStops.length === 0" class="no-results-container">
                            <p class="no-results-text">No existing stop found.</p>
                            <button class="btn-create-stop" (click)="startCreateNewStop()">
                              Create "{{ searchQuery }}"
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="showCreateNewForm" class="dropdown-inner form-mode">
                      <div class="form-title">
                        <button class="btn-back" (click)="backToSearch()">
                          <i class="bi bi-chevron-left"></i>
                        </button>
                        <span>Add Stop</span>
                      </div>
                      <div class="form-group-inline">
                        <label>Stop Name</label>
                        <input type="text" [(ngModel)]="newStopName" placeholder="Enter stop name" class="form-input-inline" />
                      </div>
                      <div class="form-group-inline address-group">
                        <label>Address</label>
                        <input type="text"
                               #addressInput
                               [(ngModel)]="newStopAddress"
                               (input)="onAddressInput()"
                               placeholder="Enter address"
                               class="form-input-inline"
                               autocomplete="off" />
                        <div *ngIf="showAddressAutocomplete && addressPredictions.length > 0" class="address-predictions">
                          <div *ngFor="let prediction of addressPredictions"
                               class="prediction-item"
                               (click)="selectAddressPrediction(prediction)">
                            <i class="bi bi-geo-alt"></i>
                            <div class="prediction-text">
                              <div class="prediction-main">{{ prediction.main_text }}</div>
                              <div class="prediction-secondary">{{ prediction.secondary_text }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button class="btn-add-stop-save" (click)="saveNewStop()">Add Stop</button>
                    </div>
        </div>
        <!-- End of dropdown -->

      <!-- Dropdown Overlay -->
      <div *ngIf="showAddStopDialog" class="dropdown-overlay" (click)="closeAddStopDialog()"></div>

      <!-- Right Panel - Patient Queue/Details -->
      <div class="right-panel">
        <!-- No Stop Selected -->
        <div *ngIf="!selectedStopId" class="map-placeholder">
          <i class="bi bi-geo-alt"></i>
          <h3>No Stop Selected</h3>
          <p>Please select an active stop from the route list to begin logging encounters.</p>
        </div>

        <!-- Patient Queue for Selected Stop -->
        <div *ngIf="selectedStopId && !selectedPatient" class="patient-queue">
          <div class="queue-header">
            <h3>{{ getSelectedStopName() }}</h3>
            <button class="btn-close" (click)="clearSelectedStop()" title="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Patient Search -->
          <div class="patient-search">
            <div class="search-input-group">
              <i class="bi bi-search"></i>
              <input type="text"
                     [(ngModel)]="patientSearchQuery"
                     (input)="searchPatients()"
                     placeholder="Search patients by name or SSN..."
                     class="search-input" />
            </div>
          </div>

          <!-- Search Results -->
          <div class="search-results" *ngIf="patientSearchQuery.trim() !== ''">
            <div *ngIf="patientSearchResults.length === 0" class="no-results">
              <p>No patients found</p>
            </div>
            <div *ngFor="let result of patientSearchResults" class="patient-result-item">
              <!-- Restricted Match -->
              <div *ngIf="result.isRestricted" class="restricted-match">
                <div class="restricted-header">
                  <i class="bi bi-shield-exclamation"></i>
                  <span>Restricted Match</span>
                </div>
                <p class="restricted-note">Patient record is restricted. Emergency Guest Access required.</p>
              </div>
              <!-- Facility Patient -->
              <div *ngIf="!result.isRestricted" class="facility-patient" (click)="selectPatientForEncounter(result.patient)">
                <div class="patient-info">
                  <div class="patient-name">{{ result.patient.firstName }} {{ result.patient.lastName }}</div>
                  <div class="patient-dob">DOB: {{ result.patient.dob }}</div>
                  <div class="patient-ssn">SSN: {{ result.patient.ssn }}</div>
                </div>
                <button class="btn-log-encounter" (click)="selectPatientForEncounter(result.patient); $event.stopPropagation()">
                  Log Encounter
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Encounter Logging Form -->
        <div *ngIf="selectedPatient && !showBreakGlassModal" class="encounter-form-container">
          <div class="encounter-header">
            <button class="btn-back" (click)="clearSelectedPatient()">
              <i class="bi bi-chevron-left"></i>
            </button>
            <h3>{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</h3>
          </div>

          <form class="encounter-form">
            <!-- Medication Info -->
            <div class="form-section">
              <h4>Medication Administration</h4>

              <div class="form-group-full">
                <label>Medication Name</label>
                <input type="text"
                       [(ngModel)]="doseData.medicationName"
                       name="medicationName"
                       placeholder="Enter medication name"
                       class="form-input" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Dose</label>
                  <input type="text"
                         [(ngModel)]="doseData.dose"
                         name="dose"
                         placeholder="e.g. 500"
                         class="form-input" />
                </div>
                <div class="form-group">
                  <label>Unit</label>
                  <select [(ngModel)]="doseData.unit" name="unit" class="form-input">
                    <option value="">Select unit</option>
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Route</label>
                  <select [(ngModel)]="doseData.route" name="route" class="form-input">
                    <option value="">Select route</option>
                    <option value="oral">Oral</option>
                    <option value="iv">IV</option>
                    <option value="im">IM</option>
                    <option value="sc">SC</option>
                    <option value="topical">Topical</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Site</label>
                  <input type="text"
                         [(ngModel)]="doseData.site"
                         name="site"
                         placeholder="e.g. Left Arm"
                         class="form-input" />
                </div>
              </div>

              <div class="form-group-full">
                <label>Time</label>
                <input type="datetime-local"
                       [(ngModel)]="doseData.time"
                       name="time"
                       class="form-input" />
              </div>

              <div class="form-group-full">
                <label>Notes</label>
                <textarea [(ngModel)]="doseData.notes"
                          name="notes"
                          placeholder="Add any additional notes..."
                          class="form-textarea"
                          rows="3"></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="clearSelectedPatient()">Cancel</button>
              <button type="button" class="btn-primary" (click)="saveEncounter()">Save Encounter</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Break Glass Modal -->
      <div *ngIf="showBreakGlassModal" class="modal-overlay" (click)="closeBreakGlassModal()">
        <div class="modal-content break-glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <i class="bi bi-shield-exclamation"></i>
            <h2>Emergency Guest Access Required</h2>
            <button class="btn-close-modal" (click)="closeBreakGlassModal()">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="modal-description">You are attempting to access a restricted patient record from another facility. This action will be audited.</p>

            <div class="match-details">
              <h4>Search Match Details</h4>
              <p class="match-text">"{{ patientSearchQuery }}" matched:</p>
              <div class="matched-field">
                <i class="bi bi-check-circle"></i>
                <span>Mother's First Name</span>
              </div>
              <div class="facility-info">
                <p><strong>Home Facility:</strong> {{ breakGlassPatient?.facilityId }}</p>
              </div>
            </div>

            <div class="policy-notice">
              <i class="bi bi-info-circle"></i>
              <p>[This language can be replaced or edited based on State Policy language needs]</p>
            </div>

            <div class="attestation-section">
              <label class="attestation-checkbox">
                <input type="checkbox" [(ngModel)]="attestationConfirmed" name="attestation">
                <span>I attest that I am accessing this record solely for the purpose of administering emergency guest dosing and coordinating care, and that I have obtained written consent and filed the documentation on site.</span>
              </label>
              <p class="attestation-expiry">Access expires automatically on February 6, 2026 at 1:36 PM. This action is logged and auditable.</p>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeBreakGlassModal()">Cancel</button>
              <button class="btn-primary" [disabled]="!attestationConfirmed" (click)="confirmBreakGlassAndContinue()">
                <i class="bi bi-shield-check"></i>
                Break Glass and Attest
              </button>
            </div>
          </div>
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
      overflow: visible;
      position: relative;
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
      overflow-x: visible;
      position: relative;
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
      position: relative;
      overflow: visible;
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
      overflow-x: visible;
      flex: 1;
      min-height: 0;
      clip-path: unset;
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

    .add-stop-container {
      position: relative;
      width: 100%;
      z-index: 10;
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

    /* Dropdown Styles */
    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
    }

    .dropdown-content {
      position: absolute;
      top: calc(100% + 0.25rem);
      left: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      min-width: 18rem;
      max-height: 20rem;
      overflow-y: auto;
    }

    .dropdown-outside {
      /* Positioned below the add-stop button */
      position: absolute !important;
      top: 9.5rem !important;
      left: 1rem !important;
    }

    .dropdown-inner {
      display: flex;
      flex-direction: column;
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;

      i {
        font-size: 0.875rem;
        color: #9ca3af;
        flex-shrink: 0;
      }
    }

    .dropdown-search {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0;
      font-size: 0.875rem;
      outline: none;
      color: #1f2937;

      &::placeholder {
        color: #9ca3af;
      }
    }

    .dropdown-list {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
      max-height: 16rem;
      overflow-y: auto;
    }

    .list-group-title {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      padding: 0.5rem 0.75rem 0.25rem 0.75rem;
      letter-spacing: 0.05em;
    }

    .list-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem;
      background: white;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
      width: 100%;
      font-size: 0.75rem;

      &:hover {
        background: #f3f4f6;
      }

      i {
        flex-shrink: 0;
        color: #0c5caa;
        font-size: 0.75rem;
        margin-top: 0.125rem;
      }
    }

    .list-item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .list-item-name {
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .list-item-address {
      color: #6b7280;
      font-size: 0.7rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-results-container {
      padding: 1rem 0.75rem;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .no-results-text {
      margin: 0 0 0.75rem 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .btn-create-stop {
      width: 100%;
      padding: 0.625rem 0.75rem;
      background: #0c5caa;
      color: white;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;

      &:hover {
        background: #0a4a85;
      }
    }

    .form-mode {
      padding: 0.75rem;
    }

    .form-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .btn-back {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1rem;
      }

      &:hover {
        color: #1f2937;
      }
    }

    .form-group-inline {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;

      label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #374151;
      }
    }

    .form-input-inline {
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      background-color: #f9fafb;
      transition: all 0.15s;

      &:focus {
        outline: none;
        border-color: #0c5caa;
        background-color: white;
        box-shadow: 0 0 0 2px rgba(12, 92, 170, 0.1);
      }
    }

    .btn-add-stop-save {
      padding: 0.625rem;
      background: #0c5caa;
      color: white;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 0.5rem;

      &:hover {
        background: #0a4a85;
      }
    }

    /* Address Autocomplete Styles */
    .address-group {
      position: relative;
    }

    .address-predictions {
      position: absolute;
      top: calc(100% + 0.25rem);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      z-index: 100;
      max-height: 200px;
      overflow-y: auto;
    }

    .prediction-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.625rem;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #f3f4f6;
      font-size: 0.75rem;

      &:hover {
        background: #f9fafb;
      }

      &:last-child {
        border-bottom: none;
      }

      i {
        flex-shrink: 0;
        color: #6b7280;
        font-size: 0.75rem;
        margin-top: 0.125rem;
      }
    }

    .prediction-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .prediction-main {
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .prediction-secondary {
      color: #6b7280;
      font-size: 0.7rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class MMUComponent implements OnInit, AfterViewInit {
  @ViewChild('addressInput') addressInput?: ElementRef;

  selectedUnit = 'unit1';

  // Google Places Autocomplete
  autocompleteService: any;
  placesService: any;
  sessionToken: any;
  showAddressAutocomplete = false;
  addressPredictions: any[] = [];

  routeStops: RouteStop[] = [
    {
      id: '1',
      name: 'Downtown Shelter',
      address: '100 E 4th Ave',
      facilityId: 'facility1'
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd',
      facilityId: 'facility1'
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street',
      facilityId: 'facility1'
    }
  ];

  // Available stops database (for search)
  availableStops: AvailableStop[] = [
    {
      id: '1',
      name: 'Downtown Shelter',
      address: '100 E 4th Ave',
      facilityId: 'facility1'
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd',
      facilityId: 'facility1'
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street',
      facilityId: 'facility1'
    },
    {
      id: '4',
      name: 'Fairview Rec Center',
      address: '1121 E 10th Ave',
      facilityId: 'facility1'
    },
    {
      id: '5',
      name: 'Eldercare Center',
      address: '456 Park Ave',
      facilityId: 'facility1'
    },
    {
      id: '6',
      name: 'Community Clinic',
      address: '789 Market St',
      facilityId: 'facility1'
    },
    {
      id: '7',
      name: 'Youth Services',
      address: '321 Main St',
      facilityId: 'facility1'
    }
  ];

  // Patient database
  patientsDatabase: Patient[] = [
    {
      id: 'pat1',
      firstName: 'John',
      lastName: 'Smith',
      dob: '1985-05-15',
      ssn: '123-45-6789',
      facilityId: 'facility1',
      isRestricted: false
    },
    {
      id: 'pat2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dob: '1990-08-20',
      ssn: '987-65-4321',
      facilityId: 'facility1',
      isRestricted: false
    },
    {
      id: 'pat3',
      firstName: 'Michael',
      lastName: 'Williams',
      dob: '1975-03-10',
      ssn: '456-78-9012',
      facilityId: 'facility2',
      isRestricted: true
    },
    {
      id: 'pat4',
      firstName: 'Emma',
      lastName: 'Brown',
      dob: '1988-12-25',
      ssn: '789-01-2345',
      facilityId: 'facility1',
      isRestricted: false
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

  // Patient queue and encounter state
  selectedStopId: string | null = null;
  selectedPatient: Patient | null = null;
  patientSearchQuery = '';
  patientSearchResults: PatientMatch[] = [];
  doseData: DoseAdministration = {
    medicationName: '',
    dose: '',
    unit: '',
    route: '',
    site: '',
    time: '',
    notes: ''
  };
  showBreakGlassModal = false;
  breakGlassPatient: Patient | null = null;
  attestationConfirmed = false;

  ngOnInit(): void {
    // Load today's encounters
    this.recentStops = this.availableStops.slice(0, 3);

    // Initialize Google Places services
    this.initializeGooglePlaces();
  }

  ngAfterViewInit(): void {
    // Autocomplete is now initialized via onAddressInput
  }

  private initializeGooglePlaces(): void {
    // Check if Google Maps API is already loaded
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
      this.setupGooglePlacesServices();
      return;
    }

    // Load Google Maps script dynamically with API key from environment
    const apiKey = environment.googleMapsApiKey;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
      console.warn('Google Places API key is not configured. Please set GOOGLE_PLACES_API_KEY in your environment.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.setupGooglePlacesServices();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);
  }

  private setupGooglePlacesServices(): void {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
      this.autocompleteService = new (window as any).google.maps.places.AutocompleteService();
      this.placesService = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
      this.sessionToken = new (window as any).google.maps.places.AutocompleteSessionToken();
    }
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
    this.filteredStops = [];
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
      address: stop.address,
      facilityId: stop.facilityId || 'facility1'
    });

    this.closeAddStopDialog();
  }

  startCreateNewStop(): void {
    this.newStopName = this.searchQuery;
    this.showCreateNewForm = true;
  }

  backToSearch(): void {
    this.showCreateNewForm = false;
    this.newStopName = '';
    this.newStopAddress = '';
  }

  saveNewStop(): void {
    if (this.newStopName.trim() && this.newStopAddress.trim()) {
      // Create new stop with unique ID
      const newStop: RouteStop = {
        id: Math.random().toString(36).substr(2, 9),
        name: this.newStopName,
        address: this.newStopAddress,
        facilityId: 'facility1'
      };

      // Add to route stops
      this.routeStops.push(newStop);

      // Also add to available stops for future searches
      this.availableStops.push({
        id: newStop.id,
        name: newStop.name,
        address: newStop.address,
        facilityId: 'facility1'
      });

      this.closeAddStopDialog();
    }
  }

  removeStop(stopId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.routeStops = this.routeStops.filter(stop => stop.id !== stopId);
    if (this.selectedStopId === stopId) {
      this.clearSelectedStop();
    }
  }

  onAddressInput(): void {
    // Only use Google Places if API is available
    if (!this.autocompleteService || !this.newStopAddress.trim()) {
      this.showAddressAutocomplete = false;
      this.addressPredictions = [];
      return;
    }

    // Get autocomplete predictions from Google Places API
    const request = {
      input: this.newStopAddress,
      sessionToken: this.sessionToken,
      componentRestrictions: { country: 'us' } // Restrict to US
    };

    this.autocompleteService.getPlacePredictions(request, (predictions: any[], status: any) => {
      const google = (window as any).google;
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        this.addressPredictions = predictions.slice(0, 5); // Limit to 5 predictions
        this.showAddressAutocomplete = this.addressPredictions.length > 0;
      } else {
        this.showAddressAutocomplete = false;
        this.addressPredictions = [];
      }
    });
  }

  selectAddressPrediction(prediction: any): void {
    // Update the address with the selected prediction
    this.newStopAddress = prediction.description;
    this.showAddressAutocomplete = false;
    this.addressPredictions = [];

    // If you want to get more detailed information about the place, use place_id
    // This can be useful to get coordinates, phone numbers, etc. in the future
  }
}
