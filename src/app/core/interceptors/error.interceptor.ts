import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Error Interceptor
 * Handles HTTP errors globally with centralized error handling
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error,
        });

        // Handle specific error status codes
        switch (error.status) {
          case 401:
            // Unauthorized - trigger logout
            this.handleUnauthorized();
            break;
          case 403:
            // Forbidden
            console.warn('Access forbidden');
            break;
          case 404:
            // Not found
            console.warn('Resource not found');
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors
            console.error('Server error');
            break;
        }

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error,
        }));
      }),
    );
  }

  /**
   * Extract error message from HTTP error response
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return error.error.message || 'An error occurred';
    } else {
      // Server-side error
      return (
        error.error?.message ||
        error.message ||
        `Server error: ${error.status}`
      );
    }
  }

  /**
   * Handle unauthorized (401) errors
   */
  private handleUnauthorized(): void {
    // Could trigger logout or redirect to login
    // This depends on your auth implementation
  }
}
