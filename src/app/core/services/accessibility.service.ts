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
    const body = document.body;

    // Apply high contrast mode
    if (settings.highContrast) {
      html.setAttribute('data-high-contrast', 'true');
      html.classList.add('high-contrast-mode');
      body.classList.add('high-contrast-mode');
    } else {
      html.removeAttribute('data-high-contrast');
      html.classList.remove('high-contrast-mode');
      body.classList.remove('high-contrast-mode');
    }

    // Apply text size - remove all text size classes first
    html.classList.remove('text-size-large', 'text-size-extra');
    body.classList.remove('text-size-large', 'text-size-extra');

    // Add the appropriate text size class to HTML element
    if (settings.textSize === 'large') {
      html.classList.add('text-size-large');
      body.classList.add('text-size-large');
    } else if (settings.textSize === 'extra') {
      html.classList.add('text-size-extra');
      body.classList.add('text-size-extra');
    }

    // Set data attribute for reference
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

  forceApplySettings(): void {
    this.applySettings();
  }
}
