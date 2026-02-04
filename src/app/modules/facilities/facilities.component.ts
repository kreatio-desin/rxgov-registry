import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService, Facility } from '../../core/services/facility.service';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="facilities-container">
      <div class="page-header">
        <h1>OTP Facility Directory</h1>
        <p>Single source of truth for all facilities and medication units</p>
      </div>

      <div *ngIf="facilities.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <h2>No facilities found</h2>
      </div>

      <div *ngIf="facilities.length > 0" class="facilities-grid">
        <div *ngFor="let facility of facilities" class="facility-card">
          <div class="facility-header">
            <h3>{{ facility.name }}</h3>
            <span class="type-badge" [class]="facility.type">{{ facility.type | uppercase }}</span>
          </div>

          <div class="facility-info">
            <div class="info-item">
              <i class="bi bi-geo-alt"></i>
              <div>
                <p class="label">Address</p>
                <p>{{ facility.address }}, {{ facility.city }}, {{ facility.state }} {{ facility.zip }}</p>
              </div>
            </div>

            <div class="info-item">
              <i class="bi bi-telephone"></i>
              <div>
                <p class="label">Phone</p>
                <p>{{ facility.phone }}</p>
              </div>
            </div>

            <div *ngIf="facility.fax" class="info-item">
              <i class="bi bi-fax"></i>
              <div>
                <p class="label">Fax</p>
                <p>{{ facility.fax }}</p>
              </div>
            </div>
          </div>

          <div class="facility-services">
            <p class="label">Services</p>
            <div class="service-tags">
              <span *ngFor="let service of facility.services" class="service-tag">
                {{ service }}
              </span>
            </div>
          </div>

          <div *ngIf="facility.keyPersonnel.length > 0" class="facility-personnel">
            <p class="label">Key Personnel</p>
            <div *ngFor="let person of facility.keyPersonnel" class="personnel-item">
              <p><strong>{{ person.role }}:</strong> {{ person.name }}</p>
            </div>
          </div>

          <div *ngIf="facility.region" class="facility-region">
            <i class="bi bi-pin-map"></i>
            {{ facility.region }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .facilities-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;

      i {
        font-size: 4rem;
        color: #ccc;
        display: block;
        margin-bottom: 1rem;
      }

      h2 {
        color: #666;
        margin: 0;
      }
    }

    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .facility-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
      border-left: 4px solid #0c5caa;

      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
    }

    .facility-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        color: #0c5caa;
        flex: 1;
      }
    }

    .type-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      white-space: nowrap;
      margin-left: 0.5rem;

      &.otc {
        background: #d4edda;
        color: #155724;
      }

      &.mmu {
        background: #d1ecf1;
        color: #0c5257;
      }
    }

    .facility-info,
    .facility-personnel {
      margin-bottom: 1.5rem;
    }

    .info-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      i {
        font-size: 1.2rem;
        color: #0c5caa;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }

      p {
        margin: 0;

        &.label {
          font-weight: bold;
          color: #333;
          font-size: 0.85rem;
        }

        &:not(.label) {
          color: #666;
          font-size: 0.95rem;
        }
      }
    }

    .facility-services {
      margin-bottom: 1.5rem;

      .label {
        font-weight: bold;
        color: #333;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }
    }

    .service-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .service-tag {
      display: inline-block;
      background: #f0f0f0;
      color: #333;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .facility-personnel {
      .label {
        font-weight: bold;
        color: #333;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }

      .personnel-item {
        font-size: 0.9rem;
        color: #666;
        margin: 0.5rem 0;

        p {
          margin: 0;
        }
      }
    }

    .facility-region {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #666;

      i {
        font-size: 1rem;
      }
    }

    @media (max-width: 768px) {
      .facilities-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FacilitiesComponent implements OnInit {
  facilities: Facility[] = [];

  constructor(private facilityService: FacilityService) {}

  async ngOnInit(): Promise<void> {
    this.facilities = await this.facilityService.getAllFacilities();
  }
}
