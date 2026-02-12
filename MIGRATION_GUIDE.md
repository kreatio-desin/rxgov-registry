# Migration Guide: Refactoring to Enterprise Architecture

This guide explains how to migrate the existing RxGov Registry application from the current structure to the new enterprise architecture.

## Overview of Changes

The refactoring introduces:
- ✅ Core Module (singleton services, interceptors)
- ✅ Shared Module (reusable components)
- ✅ Feature-based folder structure
- ✅ Generic HTTP Service with loader control
- ✅ HTTP Interceptors (Auth, Error, Loader)
- ✅ Environment configuration
- ✅ Proper component file separation

## Files Created During Refactoring

### Core Module Infrastructure
- `src/app/core/core.module.ts` - Core module definition
- `src/app/core/services/http.service.ts` - Generic HTTP service
- `src/app/core/services/loader.service.ts` - Loader state management
- `src/app/core/services/index.ts` - Service exports
- `src/app/core/interceptors/auth.interceptor.ts` - Auth token injection
- `src/app/core/interceptors/error.interceptor.ts` - Error handling
- `src/app/core/interceptors/loader.interceptor.ts` - Loader control
- `src/app/core/interceptors/index.ts` - Interceptor exports

### Shared Module Infrastructure
- `src/app/shared/shared.module.ts` - Shared module definition

### Environment Configuration
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

### Documentation
- `src/ARCHITECTURE.md` - Complete architecture documentation
- `MIGRATION_GUIDE.md` - This file

## Step-by-Step Migration

### Step 1: Update App Configuration (app.config.ts)

The app.config.ts should import CoreModule and register providers:

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(CoreModule),
  ],
};
```

### Step 2: Update Routes (app.routes.ts)

Update the main routes to support lazy loading:

```typescript
import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            m => m.DashboardModule
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.module').then(
            m => m.UsersModule
          ),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.module').then(
            m => m.PatientsModule
          ),
      },
      // ... other feature routes
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },
];
```

### Step 3: Extract Components to Separate Files

For each component, create three separate files:

#### Example: App Layout Component

**Before (inline template and styles):**
```typescript
@Component({
  selector: 'app-layout',
  template: `<!-- 2000+ lines of HTML -->`,
  styles: [`/* 500+ lines of CSS */`],
})
export class AppLayoutComponent { }
```

**After (separate files):**

**app-layout.component.ts:**
```typescript
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PatientService } from '../../core/services/patient.service';
// ... other imports

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('globalSearch') globalSearchInput!: ElementRef;

  searchQuery = '';
  searchResults: SearchResult[] = [];
  sidebarCollapsed = false;
  showUserMenu = false;
  showNotificationsPanel = false;
  currentUser: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    // ... other dependencies
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  // Component methods...
}
```

**app-layout.component.html:**
```html
<div class="layout-wrapper" [class.sidebar-collapsed]="sidebarCollapsed">
  <!-- Layout template content -->
</div>
```

**app-layout.component.scss:**
```scss
.layout-wrapper {
  // Layout styles
}
```

### Step 4: Migrate Existing Services

Move services to appropriate locations:

**Singleton services (Core Module):**
- AuthService → `src/app/core/services/auth.service.ts`
- LoaderService → `src/app/core/services/loader.service.ts`
- HttpService → `src/app/core/services/http.service.ts`
- SupportService → `src/app/core/services/support.service.ts`
- ThemeService → `src/app/core/services/theme.service.ts`
- AccessibilityService → `src/app/core/services/accessibility.service.ts`

**Feature-specific services:**
- PatientService → `src/app/features/patients/services/patient.service.ts`
- UserService → `src/app/features/users/services/user.service.ts`
- FacilityService → `src/app/features/facilities/services/facility.service.ts`

**Update service imports in provider array:**

```typescript
// Before: providedIn: 'root' scattered across services
@Injectable({ providedIn: 'root' })

// After: Declare in appropriate module
@Module({
  providers: [PatientService, UserService, FacilityService]
})
```

### Step 5: Create Feature Modules

For each major feature, create a module structure:

**Example: Users Feature Module**

**users.module.ts:**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './components/users.component';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [UsersComponent],
  imports: [CommonModule, SharedModule, UsersRoutingModule],
  providers: [UserService],
})
export class UsersModule {}
```

**users-routing.module.ts:**
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './components/users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
```

### Step 6: Use Generic HTTP Service

Update services to use the new generic HttpService:

**Before:**
```typescript
import { HttpClient } from '@angular/common/http';

export class UserService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get('/users');
  }
}
```

**After:**
```typescript
import { HttpService } from '../../core/services/http.service';

export class UserService {
  constructor(private httpService: HttpService) {}

  getUsers() {
    return this.httpService.get<User[]>('/users', {
      showLoader: true,
    });
  }
}
```

### Step 7: Update Component Imports

Update all component imports to use the new module structure:

**Before:**
```typescript
import { AuthService } from '../services/auth.service';
```

**After:**
```typescript
import { AuthService } from '../../core/services/auth.service';
```

### Step 8: Create Reusable Components

Move reusable components to SharedModule:

**Example: Modal Component**

**src/app/shared/components/modal/modal.component.ts:**
```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen = false;
}
```

**Update SharedModule:**
```typescript
@NgModule({
  declarations: [ModalComponent, ButtonComponent, LoaderComponent],
  imports: [CommonModule],
  exports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
```

## Migration Checklist

- [ ] Update `app.config.ts` to import CoreModule
- [ ] Update `app.routes.ts` with lazy-loaded feature modules
- [ ] Extract AppLayoutComponent to separate files
- [ ] Move core services to `core/services/`
- [ ] Create feature modules for each major feature
- [ ] Move feature-specific services to feature modules
- [ ] Update all import paths
- [ ] Create reusable components in SharedModule
- [ ] Update all HTTP service calls to use generic HttpService
- [ ] Test all functionality
- [ ] Run lint and type checks
- [ ] Update any build scripts

## Testing During Migration

### Unit Tests
```bash
ng test --watch
```

### Lint
```bash
ng lint
```

### Type Checking
```bash
ng build --configuration development
```

## Common Issues & Solutions

### Issue 1: Module Not Found
**Problem:** Cannot find module after moving services
**Solution:** Update import paths and ensure services are properly exported from index.ts files

### Issue 2: Circular Dependencies
**Problem:** Service imports component which imports the service
**Solution:** Move shared logic to a separate service or utility function

### Issue 3: Provider Not Found
**Problem:** Service is not injected correctly
**Solution:** Ensure service is provided in correct module (CoreModule for singletons, feature module for feature-specific)

### Issue 4: Lazy Loading Not Working
**Problem:** Feature module not loading
**Solution:** Ensure module is declared with `loadChildren` in routes and has routing module configured

## Performance Improvements

After migration, you'll see:
- ✅ Smaller initial bundle (lazy loading)
- ✅ Better code organization
- ✅ Reusable components across features
- ✅ Consistent error handling
- ✅ Centralized loader management
- ✅ Easier to add new features

## References

- See `src/ARCHITECTURE.md` for detailed architecture documentation
- See `src/app/core/services/http.service.ts` for HTTP service usage examples
- See Angular Style Guide: https://angular.io/guide/styleguide

## Next Steps

1. Start with Step 1-3 (App configuration, routes, and component extraction)
2. Test thoroughly before proceeding
3. Migrate services module by module
4. Create feature modules incrementally
5. Refactor components to use separate files
6. Extract reusable components to SharedModule
7. Update all service imports and usage

The migration can be done incrementally without breaking existing functionality. Start with core infrastructure, then work through each feature module.
