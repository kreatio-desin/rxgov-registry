import { Component } from '@angular/core';
import { AppLayoutComponent } from './layout/app-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppLayoutComponent],
  template: '<app-layout></app-layout>'
})
export class App {}
