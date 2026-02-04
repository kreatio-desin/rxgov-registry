import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mmu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mmu-container">
      <h1>Mobile Medication Unit (MMU) Management</h1>
      <p class="subtitle">Track patient encounters and services delivered at MMU stops</p>

      <div class="mmu-sections">
        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-van-front"></i>
            <h2>MMU Fleet</h2>
          </div>
          <p>Create and manage mobile medication units serving Alaska</p>
          <button class="btn btn-primary">Manage Units</button>
        </section>

        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-geo-alt"></i>
            <h2>Stop Locations</h2>
          </div>
          <p>Define MMU stops and schedules for patient service delivery</p>
          <button class="btn btn-primary">Configure Stops</button>
        </section>

        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-cloud-arrow-down"></i>
            <h2>Pre-Departure Sync</h2>
          </div>
          <p>Download patient data and schedules before MMU departure</p>
          <button class="btn btn-primary">Prepare Route</button>
        </section>

        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-capsule"></i>
            <h2>Encounters</h2>
          </div>
          <p>Log patient doses and services delivered at each stop</p>
          <button class="btn btn-primary">Log Encounter</button>
        </section>

        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-cloud-check"></i>
            <h2>Sync Records</h2>
          </div>
          <p>Automatically sync encounter data when connectivity is restored</p>
          <button class="btn btn-primary" disabled>Auto-Sync Active</button>
        </section>

        <section class="mmu-card">
          <div class="card-header">
            <i class="bi bi-file-earmark-text"></i>
            <h2>Reports</h2>
          </div>
          <p>View MMU service delivery statistics and encounter summaries</p>
          <button class="btn btn-primary">View Reports</button>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .mmu-container {
      max-width: 1200px;
      margin: 0 auto;

      h1 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #666;
        margin-bottom: 2rem;
      }
    }

    .mmu-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .mmu-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #0c5caa;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;

        i {
          font-size: 2rem;
          color: #0c5caa;
        }

        h2 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }
      }

      p {
        color: #666;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      background: #0c5caa;
      color: white;

      &:hover:not(:disabled) {
        background: #0a4a85;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    @media (max-width: 768px) {
      .mmu-sections {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MMUComponent {}
