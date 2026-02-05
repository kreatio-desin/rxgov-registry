import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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
  nickName?: string;
  dob: string;
  ssn: string;
  facilityId: string;
  isRestricted: boolean;
  currentMedication?: string;
  dose?: string;
  rxNumber?: string;
  lastDoseTime?: string;
  lastDoseHours?: number;
  takeHomeStatus?: string;
  recentDoses?: DoseRecord[];
}

interface DoseRecord {
  date: string;
  time: string;
  type: 'Observed' | 'Take-Home';
  amount: string;
}

interface PatientMatch {
  patient: Patient;
  isRestricted: boolean;
}

interface DoseAdministration {
  medicationName: string;
  observedDose: number | string;
  takeHomeDoses: number | string;
  takeHomeDoseAmount: number | string;
  individualCounseling: boolean;
  groupCounseling: boolean;
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
                  <div
                    *ngFor="let stop of routeStops"
                    class="stop-item"
                    [class.selected]="selectedStopId === stop.id"
                  >
                    <div class="stop-info" (click)="selectStopForPatientQueue(stop)">
                      <i class="bi bi-geo-alt"></i>
                      <div class="stop-details">
                        <div class="stop-name">{{ stop.name }}</div>
                        <div class="stop-address">{{ stop.address }}</div>
                      </div>
                    </div>
                    <button
                      class="btn-remove"
                      (click)="removeStop(stop.id, $event)"
                      title="Remove stop"
                    >
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
              <input
                type="text"
                [(ngModel)]="newStopName"
                placeholder="Enter stop name"
                class="form-input-inline"
              />
            </div>
            <div class="form-group-inline address-group">
              <label>Address</label>
              <input
                type="text"
                #addressInput
                [(ngModel)]="newStopAddress"
                (input)="onAddressInput()"
                placeholder="Enter address"
                class="form-input-inline"
                autocomplete="off"
              />
              <div
                *ngIf="showAddressAutocomplete && addressPredictions.length > 0"
                class="address-predictions"
              >
                <div
                  *ngFor="let prediction of addressPredictions"
                  class="prediction-item"
                  (click)="selectAddressPrediction(prediction)"
                >
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
        <div
          *ngIf="showAddStopDialog"
          class="dropdown-overlay"
          (click)="closeAddStopDialog()"
        ></div>

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
                <input
                  type="text"
                  [(ngModel)]="patientSearchQuery"
                  (input)="searchPatients()"
                  placeholder="Search patients by name or SSN..."
                  class="search-input"
                />
              </div>
            </div>

            <!-- Search Results -->
            <div class="search-results" *ngIf="patientSearchQuery.trim() !== ''">
              <div *ngIf="patientSearchResults.length === 0" class="no-results">
                <p>No patients found</p>
              </div>
              <div *ngFor="let result of patientSearchResults" class="patient-result-item">
                <!-- Facility Patient -->
                <div
                  *ngIf="!result.isRestricted"
                  class="facility-patient"
                  (click)="selectPatientForEncounter(result.patient)"
                >
                  <div class="patient-info">
                    <div class="patient-name-section">
                      <span class="patient-name">
                        {{ result.patient.lastName }}, {{ result.patient.firstName }}
                      </span>
                      <span *ngIf="result.patient.nickName" class="patient-nickname">
                        "{{ result.patient.nickName }}"
                      </span>
                    </div>
                    <div class="patient-meta">
                      <span class="patient-rx">{{ result.patient.rxNumber }}</span>
                      <span class="separator">•</span>
                      <span class="patient-dob">DOB: {{ result.patient.dob }}</span>
                      <span class="separator">•</span>
                      <span class="patient-ssn">SSN: {{ result.patient.ssn }}</span>
                    </div>
                    <div *ngIf="result.patient.currentMedication" class="patient-medication">
                      {{ result.patient.currentMedication }} {{ result.patient.dose }}
                    </div>
                  </div>
                  <button
                    class="btn-log-encounter"
                    (click)="selectPatientForEncounter(result.patient); $event.stopPropagation()"
                  >
                    Log Encounter
                  </button>
                </div>
                <!-- Restricted Match -->
                <div *ngIf="result.isRestricted" class="restricted-match-item">
                  <div class="restricted-match">
                    <div class="restricted-header">
                      <span>Restricted Match</span>
                      <div class="restricted-badge">
                        <i class="bi bi-shield-exclamation"></i>
                        <span>Restricted</span>
                      </div>
                    </div>
                    <div class="restricted-match-detail">Matched on: Mother's First Name</div>
                    <div class="restricted-facility">
                      <i class="bi bi-building-2"></i>
                      <span>External OTP Facility</span>
                    </div>
                  </div>
                  <button
                    class="btn-log-encounter"
                    (click)="selectPatientForEncounter(result.patient); $event.stopPropagation()"
                  >
                    Log Encounter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Encounter Logging Form -->
          <div *ngIf="selectedPatient && !showBreakGlassModal" class="encounter-form-container">
            <!-- Header -->
            <div class="encounter-header-card">
              <div class="header-top">
                <h3>Administer Dose: {{ selectedPatient.lastName }}, {{ selectedPatient.firstName }}</h3>
                <button class="btn-close-form" (click)="clearSelectedPatient()">
                  <i class="bi bi-x"></i>
                </button>
              </div>
              <p class="header-subtitle">Recording medication dose for MMU encounter</p>
            </div>

            <!-- Detailed Patient Info Card -->
            <div class="patient-card-enhanced">
              <!-- Header with Avatar and Name -->
              <div class="patient-header-row">
                <div class="patient-avatar">
                  <i class="bi bi-person"></i>
                </div>
                <div class="patient-header-info">
                  <h3>{{ selectedPatient.lastName }}, {{ selectedPatient.firstName }}</h3>
                  <p class="patient-rx-mono">{{ selectedPatient.rxNumber }}</p>
                </div>
              </div>

              <!-- Patient Metadata -->
              <div class="patient-meta-grid">
                <div class="meta-item">
                  <i class="bi bi-calendar"></i>
                  <span>DOB: {{ selectedPatient.dob }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-capsule"></i>
                  <span class="medication-highlight">
                    {{ selectedPatient.currentMedication }} {{ selectedPatient.dose }}
                  </span>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="status-badges">
                <span class="badge badge-info" *ngIf="selectedPatient.lastDoseHours !== undefined">
                  <i class="bi bi-clock"></i>
                  Last dose: {{ selectedPatient.lastDoseHours }}h ago
                </span>
                <span
                  class="badge"
                  [ngClass]="{
                    'badge-danger': selectedPatient.takeHomeStatus?.includes('No'),
                    'badge-success': selectedPatient.takeHomeStatus?.includes('Permitted'),
                  }"
                >
                  <i
                    class="bi"
                    [ngClass]="{
                      'bi-x-circle': selectedPatient.takeHomeStatus?.includes('No'),
                      'bi-check-circle': selectedPatient.takeHomeStatus?.includes('Permitted'),
                    }"
                  ></i>
                  {{ selectedPatient.takeHomeStatus }}
                </span>
              </div>

              <!-- Recent Doses Section -->
              <div class="recent-doses" *ngIf="selectedPatient.recentDoses && selectedPatient.recentDoses.length > 0">
                <p class="section-title">RECENT DOSES</p>
                <div class="doses-list">
                  <div *ngFor="let dose of selectedPatient.recentDoses" class="dose-item">
                    <div class="dose-datetime">
                      <span class="dose-date">{{ dose.date }}</span>
                      <span class="dose-time">{{ dose.time }}</span>
                    </div>
                    <span
                      class="dose-badge"
                      [ngClass]="{
                        'badge-observed': dose.type === 'Observed',
                        'badge-takehome': dose.type === 'Take-Home',
                      }"
                    >
                      {{ dose.type }}
                    </span>
                    <span class="dose-amount">{{ dose.amount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <form class="encounter-form">
              <!-- Observed Dose Section -->
              <div class="form-section observed-dose-section">
                <div class="section-header">
                  <i class="bi bi-capsule"></i>
                  <h4>Observed Dose</h4>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Medication</label>
                    <select [(ngModel)]="doseData.medicationName" name="medicationName" class="form-input">
                      <option value="">Select medication</option>
                      <option value="Methadone">Methadone</option>
                      <option value="Buprenorphine">Buprenorphine</option>
                      <option value="Naltrexone">Naltrexone</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Dose Amount (mg)</label>
                    <input
                      type="number"
                      [(ngModel)]="doseData.observedDose"
                      name="observedDose"
                      placeholder="0"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Take-Home Doses Section -->
              <div class="form-section take-home-section">
                <div class="section-header">
                  <i class="bi bi-box"></i>
                  <div>
                    <h4>Take-Home Doses</h4>
                    <p class="section-description">Additional doses dispensed for at-home administration</p>
                  </div>
                </div>
                <div class="warning-alert">
                  <i class="bi bi-exclamation-circle"></i>
                  <div>
                    <p class="warning-title">Take-Home Not Recommended</p>
                    <p class="warning-text">Patient record indicates take-home doses not currently permitted.</p>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Number of Doses</label>
                    <input
                      type="number"
                      [(ngModel)]="doseData.takeHomeDoses"
                      name="takeHomeDoses"
                      min="0"
                      placeholder="0"
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Dose Amount (mg)</label>
                    <input
                      type="number"
                      [(ngModel)]="doseData.takeHomeDoseAmount"
                      name="takeHomeDoseAmount"
                      min="0"
                      placeholder="0"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>

              <!-- Counseling Services Section -->
              <div class="form-section counseling-section">
                <div class="section-header">
                  <i class="bi bi-chat-left-text"></i>
                  <h4>Counseling Services</h4>
                </div>
                <div class="checkbox-group">
                  <div class="checkbox-item">
                    <input
                      type="checkbox"
                      id="individualCounseling"
                      [(ngModel)]="doseData.individualCounseling"
                      name="individualCounseling"
                      class="form-checkbox"
                    />
                    <label for="individualCounseling">Individual Counseling</label>
                  </div>
                  <div class="checkbox-item">
                    <input
                      type="checkbox"
                      id="groupCounseling"
                      [(ngModel)]="doseData.groupCounseling"
                      name="groupCounseling"
                      class="form-checkbox"
                    />
                    <label for="groupCounseling">Group Counseling</label>
                  </div>
                </div>
              </div>

              <!-- Clinical Notes Section -->
              <div class="form-section">
                <label>Encounter Notes (Optional)</label>
                <textarea
                  [(ngModel)]="doseData.notes"
                  name="notes"
                  placeholder="Document any clinical observations, patient concerns, or notes..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>

              <!-- Form Actions -->
              <div class="form-actions-footer">
                <button type="button" class="btn-secondary" (click)="clearSelectedPatient()">
                  Cancel
                </button>
                <button type="button" class="btn-primary-save" (click)="saveEncounter()">
                  <i class="bi bi-save"></i>
                  Save Dose
                </button>
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
              <p class="modal-description">
                You are attempting to access a restricted patient record from another facility. This
                action will be audited.
              </p>

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
                <p>
                  [This language can be replaced or edited based on State Policy language needs]
                </p>
              </div>

              <div class="attestation-section">
                <label class="attestation-checkbox">
                  <input type="checkbox" [(ngModel)]="attestationConfirmed" name="attestation" />
                  <span
                    >I attest that I am accessing this record solely for the purpose of
                    administering emergency guest dosing and coordinating care, and that I have
                    obtained written consent and filed the documentation on site.</span
                  >
                </label>
                <p class="attestation-expiry">
                  Access expires automatically on February 6, 2026 at 1:36 PM. This action is logged
                  and auditable.
                </p>
              </div>

              <div class="modal-actions">
                <button class="btn-secondary" (click)="closeBreakGlassModal()">Cancel</button>
                <button
                  class="btn-primary"
                  [disabled]="!attestationConfirmed"
                  (click)="confirmBreakGlassAndContinue()"
                >
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
  styles: [
    `
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
        background: var(--color-bg-primary);
        border-radius: 0.5rem;
        border: 1px solid var(--color-border);
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
        background: var(--color-bg-tertiary);
        border-bottom: 1px solid var(--color-border);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
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

        &.selected {
          background: #dbeafe;
          border-color: #0c5caa;
          box-shadow: 0 0 0 2px rgba(12, 92, 170, 0.1);
        }
      }

      .stop-info {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: background 0.15s;

        &:hover {
          background: rgba(12, 92, 170, 0.05);
        }

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
        background: var(--color-bg-primary);
        border-radius: 0.5rem;
        border: 2px dashed var(--color-border);
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }

      .map-placeholder {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;

        i {
          font-size: 2.5rem;
          color: var(--color-border);
          margin-bottom: 0.75rem;
          opacity: 0.3;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      }

      .btn-primary {
        background: var(--color-button-bg);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: var(--color-button-hover);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-secondary {
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--color-bg-tertiary);
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
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
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
        background: var(--color-bg-primary);
        border: none;
        cursor: pointer;
        transition: background 0.15s;
        text-align: left;
        width: 100%;
        font-size: 0.75rem;

        &:hover {
          background: var(--color-bg-tertiary);
        }

        i {
          flex-shrink: 0;
          color: var(--color-primary);
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
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .list-item-address {
        color: var(--color-text-secondary);
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
        background: var(--color-button-bg);
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
        background: var(--color-button-bg);
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
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
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
        border-bottom: 1px solid var(--color-border-light);
        font-size: 0.75rem;

        &:hover {
          background: var(--color-bg-tertiary);
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
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .prediction-secondary {
        color: var(--color-text-secondary);
        font-size: 0.7rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Patient Queue Styles */
      .patient-queue {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--color-bg-primary);
        min-height: 0;
        overflow: hidden;
      }

      .queue-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border);

        h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .btn-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          transition: color 0.2s;

          &:hover {
            color: #1f2937;
          }

          i {
            font-size: 0.875rem;
          }
        }
      }

      .patient-search {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .search-input-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        background: white;

        i {
          font-size: 0.875rem;
          color: #9ca3af;
          flex-shrink: 0;
        }
      }

      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 0.25rem;
        font-size: 0.875rem;
        outline: none;
        color: #1f2937;
        min-width: 0;

        &::placeholder {
          color: #9ca3af;
        }
      }

      .search-results {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
      }

      .no-results {
        text-align: center;
        padding: 2rem 1rem;
        color: #6b7280;
        font-size: 0.875rem;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .patient-result-item {
        display: flex;
        flex-direction: column;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
        flex-shrink: 0;
      }

      .facility-patient {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.625rem;
        background: #f9fafb;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f3f4f6;
        }

        .patient-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .patient-name-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .patient-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .patient-nickname {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .patient-meta {
          font-size: 0.7rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;

          .separator {
            opacity: 0.5;
          }

          .patient-rx {
            font-weight: 500;
            color: #1f2937;
          }
        }

        .patient-medication {
          font-size: 0.75rem;
          color: #4f46e5;
          font-weight: 500;
          margin-top: 0.125rem;
        }

        .btn-log-encounter {
          padding: 0.375rem 0.75rem;
          background: var(--color-button-bg);
          color: white;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, opacity 0.2s;
          opacity: 0;
          flex-shrink: 0;
          height: fit-content;

          &:hover {
            background: #0a4a85;
          }
        }
      }

      .facility-patient:hover .btn-log-encounter {
        opacity: 1;
      }

      .patient-header-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        .patient-avatar {
          width: 2.25rem;
          height: 2.25rem;
          min-width: 2.25rem;
          background: var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);

          i {
            font-size: 1rem;
          }
        }

        .patient-header-info {
          flex: 1;
          min-width: 0;

          h3 {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
          }

          .patient-rx-mono {
            margin: 0.25rem 0 0 0;
            font-family: monospace;
            font-size: 0.75rem;
            color: #6b7280;
          }
        }
      }

      .patient-meta-grid {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        margin-bottom: 0.75rem;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;

          i {
            font-size: 0.75rem;
            flex-shrink: 0;
          }

          .medication-highlight {
            font-weight: 600;
            color: #4f46e5;
          }
        }
      }

      .status-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid;

          i {
            font-size: 0.75rem;
          }

          &.badge-info {
            background: white;
            border-color: #cbd5e1;
            color: var(--color-text-secondary);
          }

          &.badge-success {
            background: #dcfce7;
            border-color: #86efac;
            color: #15803d;
          }

          &.badge-danger {
            background: #fee2e2;
            border-color: #fca5a5;
            color: #991b1b;
          }
        }
      }

      .recent-doses {
        padding-top: 0.75rem;
        border-top: 1px solid #d1d5db;
        margin-bottom: 0.5rem;

        .section-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
        }

        .doses-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .dose-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          font-size: 0.75rem;

          .dose-datetime {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            min-width: 0;
            flex: 1;

            .dose-date,
            .dose-time {
              color: #6b7280;
            }

            .dose-date {
              font-weight: 500;
            }
          }

          .dose-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.65rem;
            font-weight: 600;
            white-space: nowrap;
            flex-shrink: 0;

            &.badge-observed {
              background: #dbeafe;
              color: #0c4a6e;
            }

            &.badge-takehome {
              background: #dcfce7;
              color: #15803d;
            }
          }

          .dose-amount {
            font-weight: 600;
            color: #1f2937;
            min-width: auto;
            text-align: right;
          }
        }
      }

      .patient-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #f0f1f3;
        border-top: 1px solid #e5e7eb;

        .btn-view-record,
        .btn-log-encounter-large {
          flex: 1;
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .btn-view-record {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          opacity: 0;

          &:hover {
            background: #f9fafb;
            color: #374151;
          }
        }

        .btn-log-encounter-large {
          background: var(--color-button-bg);
          color: white;
          opacity: 0;

          &:hover {
            background: #0a4a85;
          }
        }
      }

      .restricted-match-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.625rem;
        overflow: hidden;

        &:hover .btn-log-encounter {
          opacity: 1;
        }

        .restricted-match {
          flex: 1;
          padding: 0.75rem;
          background: #fef3c7;
          border-radius: 0.375rem;
          border-left: 4px solid #f59e0b;

          .restricted-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            margin-bottom: 0.5rem;

            > span {
              font-weight: 600;
              color: #92400e;
              font-size: 0.875rem;
            }

            .restricted-badge {
              display: flex;
              align-items: center;
              gap: 0.375rem;
              font-size: 0.7rem;
              color: #b45309;
              background: #fcd34d;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              border: 1px solid #f59e0b;

              i {
                font-size: 0.75rem;
              }
            }
          }

          .restricted-match-detail {
            font-size: 0.75rem;
            color: #78350f;
            margin-bottom: 0.5rem;
          }

          .restricted-facility {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.7rem;
            color: #6b7280;

            i {
              font-size: 0.75rem;
            }
          }
        }

        .btn-log-encounter {
          padding: 0.375rem 0.75rem;
          background: var(--color-button-bg);
          color: white;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, opacity 0.2s;
          flex-shrink: 0;
          height: fit-content;
          opacity: 0;

          &:hover {
            background: #0a4a85;
          }
        }
      }

      /* Encounter Form Styles */
      .encounter-form-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0;
        padding: 0;
        background: var(--color-bg-primary);
        overflow-y: auto;
        min-height: 0;
      }

      .encounter-header-card {
        padding: 1rem;
        background: linear-gradient(to right, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.02));
        border-bottom: 1px solid var(--color-border);
        border-left: 4px solid #4f46e5;
        flex-shrink: 0;

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;

          h3 {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .btn-close-form {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.25rem;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            transition: color 0.2s;

            i {
              font-size: 0.875rem;
            }

            &:hover {
              color: #1f2937;
            }
          }
        }

        .header-subtitle {
          margin: 0;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      }

      .patient-card-enhanced {
        padding: 1rem;
        margin: 0 0.75rem 0.75rem 0.75rem;
        background: var(--color-bg-tertiary);
        border-radius: 0.375rem;
        border-left: 4px solid #64748b;
        flex-shrink: 0;
      }

      .patient-header-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        .patient-avatar {
          width: 2.25rem;
          height: 2.25rem;
          min-width: 2.25rem;
          background: var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);

          i {
            font-size: 1rem;
          }
        }

        .patient-header-info {
          flex: 1;
          min-width: 0;

          h3 {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.2;
          }

          .patient-rx-mono {
            margin: 0.25rem 0 0 0;
            font-family: monospace;
            font-size: 0.75rem;
            color: #6b7280;
          }
        }
      }

      .patient-meta-grid {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        margin-bottom: 0.75rem;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;

          i {
            font-size: 0.75rem;
            flex-shrink: 0;
          }

          .medication-highlight {
            font-weight: 600;
            color: #4f46e5;
          }
        }
      }

      .status-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 0.75rem;

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid;

          i {
            font-size: 0.75rem;
          }

          &.badge-info {
            background: white;
            border-color: #cbd5e1;
            color: var(--color-text-secondary);
          }

          &.badge-success {
            background: #dcfce7;
            border-color: #86efac;
            color: #15803d;
          }

          &.badge-danger {
            background: #fee2e2;
            border-color: #fca5a5;
            color: #991b1b;
          }
        }
      }

      .recent-doses {
        padding-top: 0.75rem;
        border-top: 1px solid #d1d5db;
        margin-bottom: 0.5rem;

        .section-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
        }

        .doses-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .dose-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          font-size: 0.75rem;

          .dose-datetime {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            min-width: 0;
            flex: 1;

            .dose-date,
            .dose-time {
              color: #6b7280;
            }

            .dose-date {
              font-weight: 500;
            }
          }

          .dose-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.65rem;
            font-weight: 600;
            white-space: nowrap;
            flex-shrink: 0;

            &.badge-observed {
              background: #dbeafe;
              color: #0c4a6e;
            }

            &.badge-takehome {
              background: #dcfce7;
              color: #15803d;
            }
          }

          .dose-amount {
            font-weight: 600;
            color: #1f2937;
            min-width: auto;
            text-align: right;
          }
        }
      }

      .patient-card {
        padding: 1rem;
        margin: 0.75rem;
        background: #f9fafb;
        border-radius: 0.375rem;
        border-left: 4px solid #9ca3af;
        flex-shrink: 0;

        .patient-header {
          margin-bottom: 0.5rem;

          h4 {
            margin: 0;
            font-weight: 600;
            font-size: 0.875rem;
            color: #1f2937;
          }

          .patient-rx {
            margin: 0.25rem 0 0 0;
            font-family: monospace;
            font-size: 0.75rem;
            color: #6b7280;
          }
        }

        .patient-meta-info {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          color: #6b7280;

          .meta-item {
            display: flex;
            align-items: center;
          }
        }
      }

      .encounter-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
        padding: 1rem;
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;

        h4 {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #1f2937;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;

          i {
            font-size: 0.875rem;
            margin-top: 0.125rem;
            flex-shrink: 0;
          }

          > div {
            flex: 1;

            h4 {
              margin: 0 0 0.25rem 0;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              color: #374151;
            }

            .section-description {
              margin: 0;
              font-size: 0.7rem;
              color: #6b7280;
            }
          }
        }

        &.observed-dose-section {
          background: rgba(79, 70, 229, 0.02);
          border-color: #ddd6fe;
          border-left: 4px solid #4f46e5;

          .section-header i {
            color: #4f46e5;
          }
        }

        &.take-home-section {
          background: rgba(34, 197, 94, 0.02);
          border-color: #dcfce7;
          border-left: 4px solid #22c55e;

          .section-header i {
            color: #22c55e;
          }
        }

        &.counseling-section {
          background: rgba(147, 51, 234, 0.02);
          border-color: #e9d5ff;
          border-left: 4px solid #9333ea;

          .section-header i {
            color: #9333ea;
          }
        }
      }

      .warning-alert {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 0.25rem;
        margin: 0.5rem 0;

        i {
          font-size: 0.875rem;
          color: #d97706;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        > div {
          flex: 1;

          .warning-title {
            margin: 0;
            font-weight: 600;
            font-size: 0.75rem;
            color: #92400e;
          }

          .warning-text {
            margin: 0.25rem 0 0 0;
            font-size: 0.7rem;
            color: #78350f;
          }
        }
      }

      .form-group-full {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
        }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
        }
      }

      .form-input,
      .form-textarea {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        background-color: #f9fafb;
        font-family: inherit;
        transition: all 0.15s;

        &:focus {
          outline: none;
          border-color: #0c5caa;
          background-color: white;
          box-shadow: 0 0 0 2px rgba(12, 92, 170, 0.1);
        }
      }

      .form-textarea {
        resize: vertical;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .form-checkbox {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          accent-color: #4f46e5;
        }

        label {
          margin: 0;
          font-size: 0.875rem;
          color: #1f2937;
          cursor: pointer;
        }
      }

      .form-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e5e7eb;
        margin-top: auto;
      }

      .form-actions-footer {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-radius: 0 0 0.375rem 0.375rem;
        flex-shrink: 0;
      }

      .btn-primary,
      .btn-secondary,
      .btn-primary-save {
        padding: 0.625rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        flex: 1;
      }

      .btn-primary {
        background: var(--color-button-bg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        &:hover:not(:disabled) {
          background: #0a4a85;
        }

        &:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        i {
          font-size: 0.875rem;
        }
      }

      .btn-primary-save {
        background: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        &:hover:not(:disabled) {
          background: #4338ca;
        }

        &:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        i {
          font-size: 0.875rem;
        }
      }

      .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;

        &:hover {
          background: #f9fafb;
        }
      }

      /* Break Glass Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .modal-content {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
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

      .break-glass-modal {
        max-width: 550px;
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        position: relative;

        i {
          font-size: 1.5rem;
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        h2 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          flex: 1;
        }

        .btn-close-modal {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          position: absolute;
          top: 1rem;
          right: 1rem;

          i {
            font-size: 1.25rem;
            margin: 0;
          }

          &:hover {
            color: #1f2937;
          }
        }
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .modal-description {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
      }

      .match-details {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;

        h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
        }

        .match-text {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
        }

        .matched-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #d1fae5;
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;

          i {
            color: #059669;
            font-size: 0.875rem;
          }

          span {
            font-size: 0.875rem;
            color: #065f46;
            font-weight: 500;
          }
        }

        .facility-info {
          background: white;
          padding: 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid #e5e7eb;

          p {
            margin: 0;
            font-size: 0.875rem;
            color: #374151;

            strong {
              color: #1f2937;
            }
          }
        }
      }

      .policy-notice {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #f0f9ff;
        border-radius: 0.375rem;
        border: 1px solid #bfdbfe;

        i {
          font-size: 1rem;
          color: #0284c7;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: #0369a1;
        }
      }

      .attestation-section {
        padding: 1rem;
        background: #fffbeb;
        border: 1px solid #fbbf24;
        border-radius: 0.375rem;

        .attestation-checkbox {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          user-select: none;

          input[type='checkbox'] {
            margin-top: 0.125rem;
            cursor: pointer;
            flex-shrink: 0;
          }

          span {
            font-size: 0.75rem;
            color: #78350f;
            line-height: 1.5;
          }
        }

        .attestation-expiry {
          margin: 0;
          font-size: 0.7rem;
          color: #92400e;
          font-style: italic;
        }
      }

      .modal-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .modal-actions .btn-primary,
      .modal-actions .btn-secondary {
        flex: 1;
        margin: 0;
      }
    `,
  ],
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
      facilityId: 'facility1',
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd',
      facilityId: 'facility1',
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street',
      facilityId: 'facility1',
    },
  ];

  // Available stops database (for search)
  availableStops: AvailableStop[] = [
    {
      id: '1',
      name: 'Downtown Shelter',
      address: '100 E 4th Ave',
      facilityId: 'facility1',
    },
    {
      id: '2',
      name: 'Muldoon Library',
      address: '1251 Muldoon Rd',
      facilityId: 'facility1',
    },
    {
      id: '3',
      name: 'fairview street',
      address: 'Fairview street',
      facilityId: 'facility1',
    },
    {
      id: '4',
      name: 'Fairview Rec Center',
      address: '1121 E 10th Ave',
      facilityId: 'facility1',
    },
    {
      id: '5',
      name: 'Eldercare Center',
      address: '456 Park Ave',
      facilityId: 'facility1',
    },
    {
      id: '6',
      name: 'Community Clinic',
      address: '789 Market St',
      facilityId: 'facility1',
    },
    {
      id: '7',
      name: 'Youth Services',
      address: '321 Main St',
      facilityId: 'facility1',
    },
  ];

  // Patient database
  patientsDatabase: Patient[] = [
    {
      id: 'pat1',
      firstName: 'Oliver',
      lastName: 'Smith',
      nickName: 'Ollie',
      dob: '1990-08-23',
      ssn: '5678',
      facilityId: 'facility1',
      isRestricted: false,
      currentMedication: 'Methadone',
      dose: '90mg',
      rxNumber: 'RX-0987654321',
      lastDoseTime: '02/05 2:09 PM',
      lastDoseHours: 0,
      takeHomeStatus: 'No Take-Home',
      recentDoses: [
        { date: '02/05', time: '2:09 PM', type: 'Take-Home', amount: '1mg' },
        { date: '02/05', time: '1:18 PM', type: 'Observed', amount: '90mg' },
        { date: '02/04', time: '1:33 PM', type: 'Observed', amount: '90mg' },
      ],
    },
    {
      id: 'pat2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dob: '1990-08-20',
      ssn: '987-65-4321',
      facilityId: 'facility1',
      isRestricted: false,
      currentMedication: 'Buprenorphine',
      dose: '8mg',
      rxNumber: 'RX-1234567890',
      lastDoseTime: '02/05 10:30 AM',
      lastDoseHours: 4,
      takeHomeStatus: 'Take-Home Permitted',
      recentDoses: [
        { date: '02/05', time: '10:30 AM', type: 'Observed', amount: '8mg' },
        { date: '02/04', time: '10:15 AM', type: 'Observed', amount: '8mg' },
        { date: '02/03', time: '9:45 AM', type: 'Observed', amount: '8mg' },
      ],
    },
    {
      id: 'pat3',
      firstName: 'Michael',
      lastName: 'Williams',
      nickName: 'Mike',
      dob: '1975-03-10',
      ssn: '456-78-9012',
      facilityId: 'facility2',
      isRestricted: true,
      currentMedication: 'Naltrexone',
      dose: '50mg',
      rxNumber: 'RX-5555555555',
      lastDoseTime: '02/04 3:15 PM',
      lastDoseHours: 23,
      takeHomeStatus: 'No Take-Home',
      recentDoses: [
        { date: '02/04', time: '3:15 PM', type: 'Observed', amount: '50mg' },
        { date: '02/03', time: '2:45 PM', type: 'Observed', amount: '50mg' },
      ],
    },
    {
      id: 'pat4',
      firstName: 'Emma',
      lastName: 'Brown',
      dob: '1988-12-25',
      ssn: '789-01-2345',
      facilityId: 'facility1',
      isRestricted: false,
      currentMedication: 'Methadone',
      dose: '60mg',
      rxNumber: 'RX-4444444444',
      lastDoseTime: '02/05 9:00 AM',
      lastDoseHours: 5,
      takeHomeStatus: 'Take-Home Permitted',
      recentDoses: [
        { date: '02/05', time: '9:00 AM', type: 'Observed', amount: '60mg' },
        { date: '02/04', time: '8:45 AM', type: 'Observed', amount: '60mg' },
        { date: '02/03', time: '9:15 AM', type: 'Observed', amount: '60mg' },
      ],
    },
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
    observedDose: '',
    takeHomeDoses: '',
    takeHomeDoseAmount: '',
    individualCounseling: false,
    groupCounseling: false,
    notes: '',
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
      console.warn(
        'Google Places API key is not configured. Please set GOOGLE_PLACES_API_KEY in your environment.',
      );
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
      this.placesService = new (window as any).google.maps.places.PlacesService(
        document.createElement('div'),
      );
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
    this.filteredStops = this.availableStops.filter(
      (stop) =>
        stop.name.toLowerCase().includes(query) || stop.address.toLowerCase().includes(query),
    );
  }

  selectStop(stop: AvailableStop): void {
    // Check if stop is already in route
    const existingStop = this.routeStops.find((s) => s.id === stop.id);
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
      facilityId: stop.facilityId || 'facility1',
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
        facilityId: 'facility1',
      };

      // Add to route stops
      this.routeStops.push(newStop);

      // Also add to available stops for future searches
      this.availableStops.push({
        id: newStop.id,
        name: newStop.name,
        address: newStop.address,
        facilityId: 'facility1',
      });

      this.closeAddStopDialog();
    }
  }

  removeStop(stopId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.routeStops = this.routeStops.filter((stop) => stop.id !== stopId);
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
      componentRestrictions: { country: 'us' }, // Restrict to US
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

  // Patient Queue Methods
  selectStopForPatientQueue(stop: RouteStop): void {
    this.selectedStopId = stop.id;
    this.patientSearchQuery = '';
    this.patientSearchResults = [];
    this.selectedPatient = null;
    this.breakGlassPatient = null;
    this.showBreakGlassModal = false;
    this.attestationConfirmed = false;
  }

  clearSelectedStop(): void {
    this.selectedStopId = null;
    this.patientSearchQuery = '';
    this.patientSearchResults = [];
    this.selectedPatient = null;
    this.breakGlassPatient = null;
    this.showBreakGlassModal = false;
    this.attestationConfirmed = false;
  }

  getSelectedStopName(): string {
    const stop = this.routeStops.find((s) => s.id === this.selectedStopId);
    return stop?.name || 'Selected Stop';
  }

  searchPatients(): void {
    if (!this.selectedStopId || !this.patientSearchQuery.trim()) {
      this.patientSearchResults = [];
      return;
    }

    const selectedStop = this.routeStops.find((s) => s.id === this.selectedStopId);
    if (!selectedStop) {
      return;
    }

    const query = this.patientSearchQuery.toLowerCase();

    // Search in patient database
    this.patientSearchResults = this.patientsDatabase
      .filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(query) ||
          patient.lastName.toLowerCase().includes(query) ||
          patient.ssn.includes(query),
      )
      .map((patient) => ({
        patient,
        isRestricted: patient.facilityId !== selectedStop.facilityId || patient.isRestricted,
      }));
  }

  selectPatientForEncounter(patient: Patient): void {
    // Check if patient is restricted
    const selectedStop = this.routeStops.find((s) => s.id === this.selectedStopId);
    if (!selectedStop) {
      return;
    }

    if (patient.facilityId !== selectedStop.facilityId || patient.isRestricted) {
      // Show break glass modal
      this.breakGlassPatient = patient;
      this.showBreakGlassModal = true;
      this.attestationConfirmed = false;
    } else {
      // Patient is in facility, show encounter form
      this.selectedPatient = patient;
      this.resetDoseData();
    }
  }

  closeBreakGlassModal(): void {
    this.showBreakGlassModal = false;
    this.breakGlassPatient = null;
    this.attestationConfirmed = false;
  }

  confirmBreakGlassAndContinue(): void {
    if (this.attestationConfirmed && this.breakGlassPatient) {
      this.selectedPatient = this.breakGlassPatient;
      this.showBreakGlassModal = false;
      this.breakGlassPatient = null;
      this.resetDoseData();
    }
  }

  selectPatientForEncounterFromModal(): void {
    if (this.attestationConfirmed && this.breakGlassPatient) {
      this.confirmBreakGlassAndContinue();
    }
  }

  clearSelectedPatient(): void {
    this.selectedPatient = null;
    this.resetDoseData();
    this.patientSearchQuery = '';
    this.patientSearchResults = [];
  }

  resetDoseData(): void {
    this.doseData = {
      medicationName: '',
      observedDose: '',
      takeHomeDoses: '',
      takeHomeDoseAmount: '',
      individualCounseling: false,
      groupCounseling: false,
      notes: '',
    };
  }

  saveEncounter(): void {
    if (!this.selectedPatient || !this.doseData.medicationName.trim() || !this.doseData.observedDose) {
      console.warn('Missing required fields');
      return;
    }

    // Create new encounter record
    const encounter: Encounter = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: `${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      service: `${this.doseData.medicationName} - ${this.doseData.observedDose}mg`,
    };

    // Add to today's encounters
    this.todayEncounters.push(encounter);

    // Clear the form
    this.clearSelectedPatient();

    // Show success feedback (could be a toast notification)
    console.log('Encounter saved successfully', encounter);
  }
}
