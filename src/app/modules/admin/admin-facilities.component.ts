import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacilityService, Facility } from '../../core/services/facility.service';
import { AuthService } from '../../core/services/auth.service';


interface FacilityForm {
  name: string;
  address: string;
  phone: string;
  autoInactivationDays: number | undefined;
}

interface MMUForm {
  name: string;
  facilityId: string;
}

@Component({
  selector: 'app-admin-facilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-facilities-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">System Settings and Data Quality</h1>
          <p class="page-description">Monitor automated integration health and resolve data exceptions.</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button
            class="tab-button"
            [class.active]="activeTab === 'facilities'"
            (click)="activeTab = 'facilities'"
          >
            Facilities
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab === 'mmus'"
            (click)="activeTab = 'mmus'"
          >
            MMUs
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab === 'audit'"
            (click)="activeTab = 'audit'"
          >
            Audit Logs
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab === 'integrations'"
            (click)="activeTab = 'integrations'"
          >
            Integrations
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab === 'emergency'"
            (click)="activeTab = 'emergency'"
          >
            Emergency
          </button>
        </div>
      </div>

      <!-- Facilities Tab -->
      <div *ngIf="activeTab === 'facilities'" class="tab-content">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-header-content">
              <h3 class="section-title">Registered Treatment Centers</h3>
              <p class="section-description">Manage contact details and key personnel for all connected facilities.</p>
            </div>
            <button class="btn-add-facility" (click)="openAddModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add Facility
            </button>
          </div>

          <!-- Facilities Table -->
          <div class="card">
            <div class="table-wrapper">
              <table class="facilities-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Auto Inactive (Days)</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let facility of facilities" class="table-row">
                    <td class="facility-name">
                      <div class="facility-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M10 12h4"></path>
                          <path d="M10 8h4"></path>
                          <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                          <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                          <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
                        </svg>
                      </div>
                      {{ facility.name }}
                    </td>
                    <td>{{ facility.address }}{{ facility.city ? ', ' + facility.city : '' }}{{ facility.state ? ', ' + facility.state : '' }}</td>
                    <td>{{ facility.phone }}</td>
                    <td class="text-center">{{ facility.autoInactivationDays || 30 }}</td>
                    <td class="text-right">
                      <button class="btn-action edit" (click)="openEditModal(facility)" title="Edit facility">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- MMUs Tab -->
      <div *ngIf="activeTab === 'mmus'" class="tab-content">
        <div class="tab-section">
          <div class="section-header">
            <div class="section-header-content">
              <h3 class="section-title">Mobile Medication Units (MMUs)</h3>
              <p class="section-description">Manage MMUs and their assigned facilities</p>
            </div>
            <button class="btn-add-facility" (click)="openAddMMUModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add MMU
            </button>
          </div>

          <div class="card">
            <div class="table-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>MMU Name</th>
                    <th>Facility</th>
                    <th>Stops</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="mmus.length === 0" class="table-row">
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #6b7280;">
                      No MMUs configured yet
                    </td>
                  </tr>
                  <tr *ngFor="let mmu of mmus" class="table-row">
                    <td class="cell-with-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="table-icon">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                        <path d="M15 18H9"></path>
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                        <circle cx="17" cy="18" r="2"></circle>
                        <circle cx="7" cy="18" r="2"></circle>
                      </svg>
                      {{ mmu.name }}
                    </td>
                    <td>{{ mmu.facilityName }}</td>
                    <td>{{ mmu.stops || '0' }} stops</td>
                    <td class="text-right">
                      <button class="btn-action edit" (click)="openEditMMUModal(mmu)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Logs Tab -->
      <div *ngIf="activeTab === 'audit'" class="tab-content">
        <div class="tab-section">
          <div class="card">
            <div class="card-header">
              <div>
                <h4 class="card-title">Security and Access Audit Log</h4>
                <p class="card-description">Track sensitive data access, report downloads, and critical system actions.</p>
              </div>
              <button class="btn-add-facility">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                  <path d="M12 15V3"></path>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <path d="m7 10 5 5 5-5"></path>
                </svg>
                Export CSV
              </button>
            </div>

            <div class="card-content space-y-4">
              <!-- Info Box -->
              <div class="info-box">
                <div class="info-box-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  <span>What activities are logged?</span>
                </div>
              </div>

              <!-- Filters -->
              <div class="filters-grid">
                <div class="filter-item full-width">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="filter-icon">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                  <input type="text" class="form-input" placeholder="Search action, user, or details..." />
                </div>
                <select class="form-input">
                  <option>All Actions</option>
                  <option>Login</option>
                  <option>Logout</option>
                  <option>Patient Viewed</option>
                </select>
              </div>

              <div class="date-filters">
                <div>
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-input" />
                </div>
                <div>
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-input" />
                </div>
              </div>

              <!-- Pagination -->
              <div class="pagination-info">
                <span>Showing 1-8 of 80 records</span>
                <div class="pagination-buttons">
                  <button class="btn-pagination" disabled>‹</button>
                  <span>Page 1 of 10</span>
                  <button class="btn-pagination">›</button>
                </div>
              </div>

              <!-- Table -->
              <div class="table-wrapper">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="mono-text">2026-02-06 16:09:22</td>
                      <td><span class="badge badge-default">LOGIN</span></td>
                      <td>Oliver Smith</td>
                      <td class="text-muted">User logged in</td>
                    </tr>
                    <tr>
                      <td class="mono-text">2026-02-06 15:29:20</td>
                      <td><span class="badge badge-default">LOGOUT</span></td>
                      <td>Oliver Smith</td>
                      <td class="text-muted">User logged out</td>
                    </tr>
                    <tr>
                      <td class="mono-text">2026-02-06 14:52:15</td>
                      <td><span class="badge badge-default">PATIENT VIEWED</span></td>
                      <td>Henry Taylor</td>
                      <td class="text-muted">Patient record viewed</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Bottom -->
              <div class="pagination-bottom">
                <button class="btn-pagination" disabled>‹</button>
                <span>Page 1 of 10</span>
                <button class="btn-pagination">›</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Integrations Tab -->
      <div *ngIf="activeTab === 'integrations'" class="tab-content">
        <div class="tab-section">
          <div class="integrations-header">
            <div>
              <h3 class="section-title flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="integration-icon">
                  <path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"></path>
                  <path d="M17 21v-2"></path>
                  <path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"></path>
                  <path d="M21 21v-2"></path>
                  <path d="M3 5V3"></path>
                  <path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"></path>
                  <path d="M7 5V3"></path>
                </svg>
                OTP System Integrations
              </h3>
              <p class="section-description">Manage modern FHIR R4 and legacy HL7 v2.5.1 connections to external OTP systems.</p>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Configured Connections</h4>
              <p class="card-description">Manage MLLP listeners, IP whitelisting, and HL7 message mappings for each vendor.</p>
            </div>

            <div class="card-content">
              <div class="table-wrapper">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Facility</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Last Sync</th>
                      <th>24h Messages</th>
                      <th>Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="facilities.length === 0">
                      <td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">
                        No facilities available
                      </td>
                    </tr>
                    <tr *ngFor="let facility of facilities" class="table-row">
                      <td>
                        <div class="vendor-info">
                          <div class="vendor-name">{{ facility.name }}</div>
                          <span class="badge badge-secondary">{{ facility.type === 'otc' ? 'OTC' : 'MMU' }}</span>
                        </div>
                      </td>
                      <td class="text-muted">{{ facility.address }}{{ facility.city ? ', ' + facility.city : '' }}</td>
                      <td><span class="badge badge-success">Active</span></td>
                      <td class="text-muted">{{ facility.updatedAt ? (facility.updatedAt | date: 'MMM d, h:mm a') : 'N/A' }}</td>
                      <td>{{ Math.floor(Math.random() * 2000) }}</td>
                      <td>{{ Math.floor(Math.random() * 5 * 10) / 10 }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Tab -->
      <div *ngIf="activeTab === 'emergency'" class="tab-content">
        <div class="emergency-section">
          <div class="emergency-header">
            <div>
              <h2 class="emergency-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="emergency-icon">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
                Emergency Management Module
              </h2>
              <p class="emergency-description">Manage clinic status, broadcast alerts, and coordinate displaced patient care.</p>
            </div>
            <div class="resilience-toggle">
              <label class="toggle-label">
                <input type="checkbox" class="toggle-input" />
                <div class="toggle-switch"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
                  <path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path>
                  <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path>
                  <path d="M12 2v4"></path>
                  <path d="m2 2 20 20"></path>
                </svg>
                <div class="toggle-text">
                  <span class="toggle-title">Resilience Mode</span>
                  <span class="toggle-subtitle">Simulate Offline/Outage</span>
                </div>
              </label>
            </div>
          </div>

          <div class="emergency-content">
            <div class="card emergency-card">
              <div class="card-header">
                <h4 class="card-title flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="broadcast-icon">
                    <path d="M16.247 7.761a6 6 0 0 1 0 8.478"></path>
                    <path d="M19.075 4.933a10 10 0 0 1 0 14.134"></path>
                    <path d="M4.925 19.067a10 10 0 0 1 0-14.134"></path>
                    <path d="M7.753 16.239a6 6 0 0 1 0-8.478"></path>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                  Broadcast Status
                </h4>
                <p class="card-description">Update your facility status for SOTA and the regional network.</p>
              </div>

              <div class="card-content">
                <div class="form-group">
                  <label class="form-label">Target Facility</label>
                  <select class="form-input" [(ngModel)]="selectedFacilityForEmergency">
                    <option value="">-- Select a facility --</option>
                    <option *ngFor="let facility of facilities" [value]="facility.id">{{ facility.name }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Current Operational Status</label>
                  <select class="form-input">
                    <option>Open / Normal Operations</option>
                    <option>Limited Operations</option>
                    <option>Emergency Closure</option>
                    <option>Relocated Services</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Alert Message</label>
                  <textarea class="form-input textarea" placeholder="e.g. Clinic closed due to severe weather. Patients redirected to NDTC...">Normal Operations Resumed</textarea>
                </div>

                <div class="alert-preview">
                  <div class="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="megaphone-icon">
                      <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path>
                      <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"></path>
                      <path d="M8 6v8"></path>
                    </svg>
                  </div>
                  <div class="alert-text">
                    <div class="alert-title">Broadcast Preview</div>
                    <div class="alert-message">OPEN: Normal Operations Resumed</div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button class="btn-emergency">Update Status and Notify Network</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Facility Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Facility' : 'Add New Facility' }}</h2>
            <p>{{ isEditMode ? 'Update facility information and configurations.' : 'Add a new treatment center to the system.' }}</p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Basic Information -->
            <div class="form-section">
              <h4 class="section-title">Basic Information</h4>
              <div class="form-group">
                <label for="facilityName" class="form-label">
                  Facility Name <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="facilityName"
                  name="facilityName"
                  class="form-input"
                  placeholder="Enter facility name"
                  [(ngModel)]="facilityForm.name"
                />
              </div>

              <div class="form-group">
                <label for="facilityAddress" class="form-label">
                  Address <span class="required">*</span>
                </label>
                <div class="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    type="text"
                    id="facilityAddress"
                    name="facilityAddress"
                    class="form-input"
                    placeholder="Search for an address"
                    [(ngModel)]="facilityForm.address"
                  />
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Contact Details -->
            <div class="form-section">
              <h4 class="section-title">Contact Details</h4>
              <div class="form-group">
                <label for="facilityPhone" class="form-label">
                  Phone <span class="required">*</span>
                </label>
                <input
                  type="tel"
                  id="facilityPhone"
                  name="facilityPhone"
                  class="form-input"
                  placeholder="(555) 555-5555"
                  [(ngModel)]="facilityForm.phone"
                />
              </div>
            </div>

            <div class="separator"></div>

            <!-- Policy Configuration -->
            <div class="form-section">
              <h4 class="section-title">Policy Configuration</h4>
              <div class="form-group">
                <label for="autoInactivationDays" class="form-label">
                  Automatic Inactivation Threshold (Days)
                </label>
                <input
                  type="number"
                  id="autoInactivationDays"
                  name="autoInactivationDays"
                  class="form-input"
                  min="1"
                  max="365"
                  [(ngModel)]="facilityForm.autoInactivationDays"
                />
                <p class="help-text">Patients with no dosing activity for this many days will be automatically set to Inactive status.</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveFacility()">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit MMU Modal -->
      <div *ngIf="showMMUModal" class="modal-overlay" (click)="closeMMUModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button class="modal-close" (click)="closeMMUModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <h2>{{ isEditingMMU ? 'Edit MMU' : 'Add New MMU' }}</h2>
            <p>{{ isEditingMMU ? 'Update the Mobile Medication Unit information.' : 'Add a new Mobile Medication Unit to the system.' }}</p>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <div class="form-section">
              <h4 class="section-title">Basic Information</h4>
              <div class="form-group">
                <label for="mmuName" class="form-label">
                  MMU Name <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="mmuName"
                  name="mmuName"
                  class="form-input"
                  placeholder="e.g., Anchorage Mobile Unit 1"
                  [(ngModel)]="mmuForm.name"
                />
              </div>
              <div class="form-group">
                <label for="clinicId" class="form-label">
                  Assigned Facility <span class="required">*</span>
                </label>
                <select
                  id="clinicId"
                  name="clinicId"
                  class="form-input"
                  [(ngModel)]="mmuForm.facilityId"
                >
                  <option value="">-- Select a facility --</option>
                  <option *ngFor="let facility of facilities" [value]="facility.id">{{ facility.name }}</option>
                </select>
                <p class="help-text">Select the facility that manages this MMU</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeMMUModal()">Cancel</button>
            <button class="btn-save" (click)="saveMMU()">{{ isEditingMMU ? 'Update MMU' : 'Add MMU' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-facilities-container {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 0.5rem;
      color: #1f2937;
    }

    .page-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Tabs Styling */
    .tabs-container {
      margin-bottom: 2rem;
    }

    .tabs-header {
      display: flex;
      gap: 0;
      background: #f3f4f6;
      border-radius: 0.75rem;
      padding: 0.25rem;
    }

    .tab-button {
      flex: 1;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #374151;
      }

      &.active {
        background: white;
        color: #1f2937;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }

    .tab-content {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .tab-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .section-header-content {
      flex: 1;
    }

    .section-title {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.5rem;
    }

    .section-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: #6b7280;
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
    }

    .btn-add-facility {
      background: var(--color-button-bg);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
      white-space: nowrap;

      &:hover {
        background: var(--color-button-hover);
      }

      .icon {
        width: 1rem;
        height: 1rem;
      }
    }

    .card {
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .facilities-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        background: var(--color-bg-tertiary);
        border-bottom: 1px solid var(--color-border);
      }

      th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-primary);
      }

      tbody tr {
        transition: background 0.15s;

        &:hover {
          background: var(--color-bg-tertiary);
        }

        &:last-child td {
          border-bottom: none;
        }
      }
    }

    .facility-name {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .facility-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: var(--color-bg-tertiary);
      border-radius: 0.375rem;
      color: #6b7280;
      flex-shrink: 0;

      svg {
        width: 1rem;
        height: 1rem;
      }
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .btn-action {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;

      &:hover {
        background: var(--color-bg-tertiary);
        border-color: #9ca3af;
      }

      svg {
        width: 1rem;
        height: 1rem;
      }
    }

    /* Modal Styles */
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
      z-index: 1000;
    }

    .modal-content {
      background: var(--color-bg-primary);
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);
      max-width: 32rem;
      width: calc(100% - 2rem);
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      color: var(--color-text-primary);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    .modal-header {
      margin-bottom: 0.5rem;

      h2 {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        line-height: 1.5rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      line-height: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .required {
        color: #dc2626;
      }
    }

    .form-input {
      height: 2.25rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 0.625rem;
      width: 1rem;
      height: 1rem;
      color: #9ca3af;
      pointer-events: none;
    }

    .input-with-icon .form-input {
      padding-left: 2.25rem;
    }

    .separator {
      height: 1px;
      background: var(--color-border);
    }

    .help-text {
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .modal-footer {
      display: flex;
      flex-direction: row-reverse;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--color-border);
      margin-top: 0.5rem;
    }

    .btn-cancel {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-border);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--color-bg-tertiary);
      }
    }

    .btn-save {
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #1d4ed8;
      }
    }

    /* Admin Table Styles */
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        background: var(--color-bg-tertiary);
        border-bottom: 1px solid var(--color-border);
      }

      th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-primary);
      }

      tbody tr {
        transition: background 0.15s;

        &:hover {
          background: var(--color-bg-tertiary);
        }

        &:last-child td {
          border-bottom: none;
        }
      }
    }

    .cell-with-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }

    .table-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      color: #6b7280;
    }

    .mono-text {
      font-family: monospace;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .text-muted {
      color: #6b7280;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-default {
      background: #f3f4f6;
      color: #374151;
    }

    .badge-secondary {
      background: #e5e7eb;
      color: #374151;
      font-size: 0.7rem;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-error {
      background: #fee2e2;
      color: #7f1d1d;
    }

    /* Audit Logs Styles */
    .card-header {
      padding: 1.5rem 1.5rem 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .card-title {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.5rem;
    }

    .card-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--color-border);
    }

    .info-box {
      border-radius: 0.5rem;
      border: 1px solid #bfdbfe;
      background: #eff6ff;
      padding: 1rem;
    }

    .info-box-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e40af;
    }

    .info-icon {
      width: 1rem;
      height: 1rem;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .filter-item {
      position: relative;
      display: flex;
      align-items: center;

      &.full-width {
        grid-column: 1 / -1;
      }
    }

    .filter-icon {
      position: absolute;
      left: 0.75rem;
      width: 1rem;
      height: 1rem;
      color: #9ca3af;
      pointer-events: none;
    }

    .filter-item .form-input {
      padding-left: 2.25rem;
    }

    .date-filters {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .pagination-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pagination-bottom {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
    }

    .btn-pagination {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--color-border);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: var(--color-bg-tertiary);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Integrations Styles */
    .integrations-header {
      margin-bottom: 1.5rem;
    }

    .integration-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #6b7280;
    }

    .vendor-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .vendor-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .error-rate {
      color: #dc2626;
      font-weight: 600;
    }

    /* Emergency Styles */
    .emergency-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .emergency-header {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    .emergency-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #dc2626;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }

    .emergency-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: #dc2626;
    }

    .emergency-description {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .resilience-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #f3f4f6;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .toggle-input {
      display: none;
    }

    .toggle-switch {
      width: 2rem;
      height: 1.125rem;
      background: #d1d5db;
      border-radius: 1rem;
      position: relative;
      transition: background 0.2s;

      &::after {
        content: '';
        position: absolute;
        width: 1rem;
        height: 1rem;
        background: white;
        border-radius: 50%;
        top: 0.0625rem;
        left: 0.0625rem;
        transition: left 0.2s;
      }
    }

    .toggle-input:checked + .toggle-switch {
      background: #2563eb;

      &::after {
        left: calc(100% - 1.0625rem);
      }
    }

    .toggle-icon {
      width: 1rem;
      height: 1rem;
      color: #6b7280;
    }

    .toggle-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .toggle-title {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }

    .toggle-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .emergency-content {
      max-width: 48rem;
      margin: 0 auto;
    }

    .emergency-card {
      border-left: 4px solid #2563eb;
    }

    .broadcast-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: #2563eb;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .textarea {
      min-height: 6.25rem;
      resize: vertical;
    }

    .alert-preview {
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);
      background: #f9fafb;
      padding: 1rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .alert-icon {
      flex-shrink: 0;
    }

    .megaphone-icon {
      width: 1rem;
      height: 1rem;
      color: #6b7280;
    }

    .alert-text {
      flex: 1;
    }

    .alert-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
    }

    .alert-message {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .btn-emergency {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--color-button-bg);
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--color-button-hover);
      }
    }
  `]
})
export class AdminFacilitiesComponent implements OnInit {
  facilities: Facility[] = [];
  showModal = false;
  isEditMode = false;
  editingFacilityId: string | null = null;
  activeTab: 'facilities' | 'mmus' | 'audit' | 'integrations' | 'emergency' = 'facilities';

  facilityForm: FacilityForm = {
    name: '',
    address: '',
    phone: '',
    autoInactivationDays: 30
  };

  constructor(
    private facilityService: FacilityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFacilities();
  }

  async loadFacilities(): Promise<void> {
    try {
      this.facilities = await this.facilityService.getAllFacilities();
    } catch (error) {
      console.error('Error loading facilities:', error);
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingFacilityId = null;
    this.facilityForm = {
      name: '',
      address: '',
      phone: '',
      autoInactivationDays: 30 as number
    };
    this.showModal = true;
  }

  openEditModal(facility: Facility): void {
    this.isEditMode = true;
    this.editingFacilityId = facility.id;
    this.facilityForm = {
      name: facility.name,
      address: facility.address,
      phone: facility.phone,
      autoInactivationDays: facility.autoInactivationDays || 30
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingFacilityId = null;
  }

  async saveFacility(): Promise<void> {
    if (!this.validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (this.isEditMode && this.editingFacilityId) {
        // Update existing facility
        const facilityToUpdate = this.facilities.find(f => f.id === this.editingFacilityId);
        if (facilityToUpdate) {
          facilityToUpdate.name = this.facilityForm.name;
          facilityToUpdate.address = this.facilityForm.address;
          facilityToUpdate.phone = this.facilityForm.phone;
          facilityToUpdate.autoInactivationDays = this.facilityForm.autoInactivationDays;
          facilityToUpdate.updatedAt = new Date().toISOString();
        }
      } else {
        // Add new facility
        const newFacility: Facility = {
          id: `facility-${Date.now()}`,
          name: this.facilityForm.name,
          type: 'otc',
          address: this.facilityForm.address,
          city: '',
          state: '',
          zip: '',
          phone: this.facilityForm.phone,
          services: [],
          keyPersonnel: [],
          isActive: true,
          autoInactivationDays: this.facilityForm.autoInactivationDays,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.facilities.push(newFacility);
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Error saving facility');
    }
  }

  private validateForm(): boolean {
    return (
      this.facilityForm.name.trim().length > 0 &&
      this.facilityForm.address.trim().length > 0 &&
      this.facilityForm.phone.trim().length > 0
    );
  }
}
