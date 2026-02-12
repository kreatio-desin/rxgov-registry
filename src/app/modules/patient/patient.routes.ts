import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./patient-list.component').then(m => m.PatientListComponent)
  },
  {
    path: 'admit/new',
    loadComponent: () => import('./admit/admit.component').then(m => m.AdmitComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./patient-detail.component').then(m => m.PatientDetailComponent)
  }
];
