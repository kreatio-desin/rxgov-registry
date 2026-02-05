import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="emergency-container">
      <h1>Emergency Management & Guest Dosing</h1>
      <p class="subtitle">Handle displaced patients during emergencies and clinic closures</p>

      <div class="emergency-sections">
        <section class="emergency-card">
          <div class="card-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h2>Emergency Alerts</h2>
          </div>
          <p>Alert SOTA and other OTPs of clinic closures due to emergencies</p>
          <button class="btn btn-primary">Create Alert</button>
        </section>

        <section class="emergency-card">
          <div class="card-header">
            <i class="bi bi-shield-check"></i>
            <h2>Break Glass Access</h2>
          </div>
          <p>Attest to emergency or guest dosing authorization to access patient records</p>
          <button class="btn btn-primary">Request Access</button>
        </section>

        <section class="emergency-card">
          <div class="card-header">
            <i class="bi bi-capsule"></i>
            <h2>Guest Dosing</h2>
          </div>
          <p>Record medications dispensed to displaced patients from other clinics</p>
          <button class="btn btn-primary">Record Guest Dose</button>
        </section>

        <section class="emergency-card">
          <div class="card-header">
            <i class="bi bi-cloud-offline"></i>
            <h2>Resilience Mode</h2>
          </div>
          <p>Access cached patient data and perform guest dosing during outages</p>
          <button class="btn btn-primary" disabled>Active (Online)</button>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .emergency-container {
      max-width: 1000px;
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

    .emergency-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .emergency-card {
      background: var(--color-bg-primary);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #dc3545;

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
          color: #dc3545;
        }

        h2 {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 1.1rem;
        }
      }

      p {
        color: var(--color-text-secondary);
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
      background: var(--color-error);
      color: white;

      &:hover {
        background: #dc2626;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #6c757d;
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.btn-primary {
        background: #0c5caa;

        &:hover:not(:disabled) {
          background: #0a4a85;
        }
      }
    }

    @media (max-width: 768px) {
      .emergency-sections {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmergencyComponent {}
