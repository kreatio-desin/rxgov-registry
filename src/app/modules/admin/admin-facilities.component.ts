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
    </div>
  `,
  styles: [`
    .admin-facilities-container {
      padding: 0 1.5rem 2rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
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
  `]
})
export class AdminFacilitiesComponent implements OnInit {
  facilities: Facility[] = [];
  showModal = false;
  isEditMode = false;
  editingFacilityId: string | null = null;

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
