import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TextSize = 'normal' | 'large' | 'extra';

export interface AccessibilitySettings {
  highContrast: boolean;
  textSize: TextSize;
}

@Injectable({
  providedIn: 'root',
})
export class AccessibilityService {
  private readonly STORAGE_KEY = 'a11y-settings';

  private settingsSubject = new BehaviorSubject<AccessibilitySettings>({
    highContrast: false,
    textSize: 'normal',
  });

  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
    this.applySettings();
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        this.settingsSubject.next(settings);
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  }

  private saveSettings(settings: AccessibilitySettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  }

  private applySettings(): void {
    const settings = this.settingsSubject.value;
    const html = document.documentElement;

    // Apply high contrast mode
    if (settings.highContrast) {
      html.setAttribute('data-high-contrast', 'true');
    } else {
      html.removeAttribute('data-high-contrast');
    }

    // Apply text size
    html.setAttribute('data-text-size', settings.textSize);
  }

  getSettings(): AccessibilitySettings {
    return this.settingsSubject.value;
  }

  setHighContrast(enabled: boolean): void {
    const settings = {
      ...this.settingsSubject.value,
      highContrast: enabled,
    };
    this.settingsSubject.next(settings);
    this.saveSettings(settings);
    this.applySettings();
  }

  setTextSize(size: TextSize): void {
    const settings = {
      ...this.settingsSubject.value,
      textSize: size,
    };
    this.settingsSubject.next(settings);
    this.saveSettings(settings);
    this.applySettings();
  }

  toggleHighContrast(): void {
    const settings = this.settingsSubject.value;
    this.setHighContrast(!settings.highContrast);
  }
}
