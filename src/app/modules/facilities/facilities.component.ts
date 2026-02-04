import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacilityService, Facility } from '../../core/services/facility.service';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="facilities-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-title">
          <h2>Facility Directory</h2>
          <p>View OTPs, medication units, and key personnel.</p>
        </div>
        
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <path d="m21 21-4.34-4.34"></path>
            <circle cx="11" cy="11" r="8"></circle>
          </svg>
          <input 
            type="search" 
            placeholder="Search facilities..." 
            [(ngModel)]="searchQuery"
            (input)="filterFacilities()"
          >
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="table-wrapper hidden-mobile">
        <table class="facilities-table">
          <thead>
            <tr>
              <th class="col-name">Facility Name</th>
              <th class="col-location">Location and Contact</th>
              <th class="col-personnel">Key Personnel</th>
              <th class="col-verified">Last Verified</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let facility of filteredFacilities" class="facility-row">
              <td class="col-name">
                <div class="facility-name-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="facility-icon">
                    <path d="M10 12h4"></path>
                    <path d="M10 8h4"></path>
                    <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                    <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
                  </svg>
                  <span class="facility-name-text">{{ facility.name }}</span>
                </div>
              </td>
              <td class="col-location">
                <div class="location-info">
                  <div class="location-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ facility.address }}, {{ facility.city }}, {{ facility.state }} {{ facility.zip }}</span>
                  </div>
                  <div class="location-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small">
                      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                    </svg>
                    <span>{{ facility.phone }}</span>
                  </div>
                  <div *ngIf="facility.fax" class="location-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small">
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path>
                      <rect x="6" y="14" width="12" height="8" rx="1"></rect>
                    </svg>
                    <span>{{ facility.fax }}</span>
                  </div>
                </div>
              </td>
              <td class="col-personnel">
                <div class="personnel-list">
                  <div *ngFor="let person of facility.keyPersonnel" class="personnel-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div class="personnel-detail">
                      <span class="role-label">{{ person.role }}:</span>
                      <span class="person-name">{{ person.name }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="col-verified">
                <span class="verified-date">{{ facility.lastVerified | date: 'MMM dd, yyyy' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-cards visible-mobile">
        <div *ngFor="let facility of filteredFacilities" class="facility-card">
          <div class="card-header">
            <div class="facility-name-mobile">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="facility-icon-small">
                <path d="M10 12h4"></path>
                <path d="M10 8h4"></path>
                <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
              </svg>
              <span>{{ facility.name }}</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-section">
              <div class="info-item-mobile">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-tiny">
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span class="text-xs">{{ facility.address }}, {{ facility.city }}, {{ facility.state }} {{ facility.zip }}</span>
              </div>
              
              <div class="info-item-mobile">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-tiny">
                  <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                </svg>
                <span class="text-xs">{{ facility.phone }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-content">
              <span class="text-xs-muted">Sponsor: {{ facility.keyPersonnel[0]?.name }}</span>
              <span class="text-xs-muted">Verified: {{ facility.lastVerified | date: 'MM/dd/yy' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredFacilities.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="10" cy="7" r="4"></circle>
        </svg>
        <p>No facilities found</p>
      </div>
    </div>
  `,
  styles: [`
    .facilities-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      md-flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .header-title {
      h2 {
        margin: 0 0 0.25rem 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .search-box {
      position: relative;
      width: 100%;
      max-width: 240px;

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1rem;
        height: 1rem;
        color: #6b7280;
        pointer-events: none;
      }

      input {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2.25rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: white;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    .table-wrapper {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      overflow: auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .facilities-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        background: white;
        border-bottom: 1px solid #e5e7eb;
      }

      th {
        padding: 0.75rem 0.5rem;
        text-align: left;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        height: 2rem;
      }

      td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
      }

      tbody tr {
        transition: background-color 0.2s;

        &:hover {
          background-color: #f9fafb;
        }
      }
    }

    .col-name {
      width: 220px;
    }

    .col-location {
      min-width: 240px;
    }

    .col-personnel {
      min-width: 200px;
    }

    .col-verified {
      width: 100px;
    }

    .facility-name-cell {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .facility-icon {
      width: 1rem;
      height: 1rem;
      color: #6b7280;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .facility-name-text {
      font-weight: 500;
      color: #1f2937;
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      font-size: 0.6875rem;
    }

    .location-item {
      display: flex;
      align-items: flex-start;
      gap: 0.375rem;
    }

    .icon-small {
      width: 0.75rem;
      height: 0.75rem;
      color: #6b7280;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .location-item span {
      color: #4b5563;
      line-height: 1.4;
    }

    .personnel-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .personnel-item {
      display: flex;
      align-items: flex-start;
      gap: 0.375rem;
      font-size: 0.6875rem;
    }

    .personnel-detail {
      display: flex;
      flex-direction: column;
    }

    .role-label {
      font-weight: 600;
      color: #6b7280;
    }

    .person-name {
      color: #4b5563;
      word-break: break-word;
    }

    .verified-date {
      color: #6b7280;
      font-size: 0.625rem;
      display: block;
      margin-top: 0.125rem;
    }

    /* Mobile View */
    .hidden-mobile {
      display: block;
    }

    .visible-mobile {
      display: none;
    }

    @media (max-width: 768px) {
      .hidden-mobile {
        display: none !important;
      }

      .visible-mobile {
        display: block !important;
      }

      .mobile-cards {
        display: grid;
        gap: 0.75rem;
      }

      .facility-card {
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .card-header {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
        background: white;
      }

      .facility-name-mobile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: #1f2937;
        font-size: 0.875rem;
      }

      .facility-icon-small {
        width: 1rem;
        height: 1rem;
        color: #6b7280;
        flex-shrink: 0;
      }

      .card-body {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.75rem;
      }

      .info-section {
        border-top: 1px solid #e5e7eb;
        padding-top: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .info-item-mobile {
        display: flex;
        align-items: flex-start;
        gap: 0.375rem;
      }

      .icon-tiny {
        width: 0.75rem;
        height: 0.75rem;
        color: #6b7280;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .text-xs {
        color: #4b5563;
        line-height: 1.4;
      }

      .card-footer {
        padding: 0.75rem;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        font-size: 0.625rem;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .text-xs-muted {
        color: #6b7280;
      }

      .page-header {
        flex-direction: column;
      }

      .search-box {
        max-width: 100%;
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      color: #6b7280;

      svg {
        width: 3rem;
        height: 3rem;
        margin-bottom: 0.75rem;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }
  `]
})
export class FacilitiesComponent implements OnInit {
  facilities: Facility[] = [];
  filteredFacilities: Facility[] = [];
  searchQuery = '';

  constructor(private facilityService: FacilityService) {}

  async ngOnInit(): Promise<void> {
    this.facilities = await this.facilityService.getAllFacilities();
    this.filteredFacilities = [...this.facilities];
  }

  filterFacilities(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFacilities = [...this.facilities];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredFacilities = this.facilities.filter(facility =>
      facility.name.toLowerCase().includes(query) ||
      facility.city.toLowerCase().includes(query) ||
      facility.address.toLowerCase().includes(query) ||
      facility.phone.includes(query)
    );
  }
}
