import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
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
