import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate: CanActivateFn = (route, state) => {
    const user = this.authService.getCurrentUser();

    if (user) {
      return true;
    }

    // Redirect to login
    this.router.navigate(['/login']);
    return false;
  };
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = new AuthService(null as any);
  const router = new (require('@angular/router').Router)(null, null);
  
  const user = authService.getCurrentUser();
  if (user) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
