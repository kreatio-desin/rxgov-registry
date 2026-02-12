import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly defaultTheme: Theme = 'light';

  private themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const storedTheme = this.getStoredTheme();
    this.applyTheme(storedTheme);
  }

  private getStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored as Theme;
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage:', e);
    }
    return this.defaultTheme;
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }

  public getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  public toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}
