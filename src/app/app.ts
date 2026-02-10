import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from './layout/app-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent, LoginComponent],
  template: `
    <app-layout *ngIf="isAuthenticated; else loginScreen"></app-layout>
    <ng-template #loginScreen>
      <app-login></app-login>
    </ng-template>
  `,
  styles: [
    `
      /* Global Text Size Styles */
      /* Default (Normal) text size */
      body {
        font-size: 14px;
      }

      /* Large text size - 110% scaling */
      body.text-size-large {
        font-size: 15.4px;
      }

      body.text-size-large * {
        font-size: inherit !important;
      }

      body.text-size-large table {
        font-size: 15.4px;
      }

      body.text-size-large th {
        font-size: 13.2px;
      }

      body.text-size-large td {
        font-size: 15.4px;
      }

      body.text-size-large .cell-rxid,
      body.text-size-large .cell-name {
        font-size: 13.2px !important;
      }

      body.text-size-large .ssn-masked {
        font-size: 14.3px;
      }

      body.text-size-large .dose-info {
        font-size: 13.2px;
      }

      /* Extra text size - 125% scaling */
      body.text-size-extra {
        font-size: 17.5px;
      }

      body.text-size-extra * {
        font-size: inherit !important;
      }

      body.text-size-extra table {
        font-size: 17.5px;
      }

      body.text-size-extra th {
        font-size: 15px;
      }

      body.text-size-extra td {
        font-size: 17.5px;
      }

      body.text-size-extra .cell-rxid,
      body.text-size-extra .cell-name {
        font-size: 15px !important;
      }

      body.text-size-extra .ssn-masked {
        font-size: 16.25px;
      }

      body.text-size-extra .dose-info {
        font-size: 15px;
      }
    `,
  ],
})
export class App implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });

    // Check if user is already logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isAuthenticated = true;
    }
  }
}
