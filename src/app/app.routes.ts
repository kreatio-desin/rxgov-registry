import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'patient',
    loadChildren: () => import('./modules/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
  },
  {
    path: 'facilities',
    loadComponent: () =>
      import('./modules/facilities/facilities.component').then((m) => m.FacilitiesComponent),
  },
  {
    path: 'emergency',
    loadComponent: () =>
      import('./modules/emergency/emergency.component').then((m) => m.EmergencyComponent),
  },
  {
    path: 'mmu',
    loadComponent: () => import('./modules/mmu/mmu.component').then((m) => m.MMUComponent),
  },
  {
    path: 'compliance',
    loadComponent: () =>
      import('./modules/compliance/compliance.component').then((m) => m.ComplianceComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./modules/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./modules/users/users.component').then((m) => m.UsersComponent),
  },
];
