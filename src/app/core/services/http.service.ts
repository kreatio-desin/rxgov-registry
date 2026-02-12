import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoaderService } from './loader.service';

/**
 * Generic HTTP Service
 * Wrapper over Angular HttpClient with:
 * - Centralized error handling
 * - Dynamic headers and query params
 * - Optional loader control
 * - Strongly typed responses
 */
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(
    private http: HttpClient,
    private loaderService: LoaderService,
  ) {}

  /**
   * GET request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param options Optional request options
   */
  get<T>(
    endpoint: string,
    options?: {
      headers?: HttpHeaders;
      params?: { [key: string]: string };
      showLoader?: boolean;
    },
  ): Observable<T> {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) this.loaderService.show();

    const url = `${this.baseUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        httpParams = httpParams.set(key, options.params![key]);
      });
    }

    return this.http.get<T>(url, {
      headers: options?.headers || this.defaultHeaders,
      params: httpParams,
    });
  }

  /**
   * POST request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param body Request body
   * @param options Optional request options
   */
  post<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders;
      params?: { [key: string]: string };
      showLoader?: boolean;
    },
  ): Observable<T> {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) this.loaderService.show();

    const url = `${this.baseUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        httpParams = httpParams.set(key, options.params![key]);
      });
    }

    return this.http.post<T>(url, body, {
      headers: options?.headers || this.defaultHeaders,
      params: httpParams,
    });
  }

  /**
   * PUT request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param body Request body
   * @param options Optional request options
   */
  put<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders;
      params?: { [key: string]: string };
      showLoader?: boolean;
    },
  ): Observable<T> {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) this.loaderService.show();

    const url = `${this.baseUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        httpParams = httpParams.set(key, options.params![key]);
      });
    }

    return this.http.put<T>(url, body, {
      headers: options?.headers || this.defaultHeaders,
      params: httpParams,
    });
  }

  /**
   * PATCH request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param body Request body
   * @param options Optional request options
   */
  patch<T>(
    endpoint: string,
    body: any,
    options?: {
      headers?: HttpHeaders;
      params?: { [key: string]: string };
      showLoader?: boolean;
    },
  ): Observable<T> {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) this.loaderService.show();

    const url = `${this.baseUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        httpParams = httpParams.set(key, options.params![key]);
      });
    }

    return this.http.patch<T>(url, body, {
      headers: options?.headers || this.defaultHeaders,
      params: httpParams,
    });
  }

  /**
   * DELETE request
   * @param endpoint API endpoint (relative to baseUrl)
   * @param options Optional request options
   */
  delete<T>(
    endpoint: string,
    options?: {
      headers?: HttpHeaders;
      params?: { [key: string]: string };
      showLoader?: boolean;
    },
  ): Observable<T> {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) this.loaderService.show();

    const url = `${this.baseUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        httpParams = httpParams.set(key, options.params![key]);
      });
    }

    return this.http.delete<T>(url, {
      headers: options?.headers || this.defaultHeaders,
      params: httpParams,
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('HTTP Error:', error);
    this.loaderService.hide();
    return throwError(() => error);
  }
}
