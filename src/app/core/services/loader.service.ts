import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loader Service
 * Manages global loader state
 * Used by HTTP interceptor and HTTP service
 */
@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderSubject = new BehaviorSubject<boolean>(false);
  public loader$: Observable<boolean> = this.loaderSubject.asObservable();
  private requestCount = 0;

  /**
   * Show the loader
   */
  show(): void {
    this.requestCount++;
    this.loaderSubject.next(true);
  }

  /**
   * Hide the loader
   */
  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.loaderSubject.next(false);
    }
  }

  /**
   * Get current loader state
   */
  isLoading(): boolean {
    return this.loaderSubject.value;
  }

  /**
   * Reset loader
   */
  reset(): void {
    this.requestCount = 0;
    this.loaderSubject.next(false);
  }
}
