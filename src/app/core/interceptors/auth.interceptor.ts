import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor
 * Injects authentication token into all HTTP requests
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Get current user to check if authenticated
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      // Clone request and add auth token
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token || ''}`,
        },
      });
      return next.handle(clonedRequest);
    }

    return next.handle(request);
  }
}
