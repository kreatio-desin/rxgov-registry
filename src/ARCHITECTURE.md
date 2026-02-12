# RxGov Registry - Architecture Documentation

## Overview

This is an enterprise-grade Angular application following modern best practices and architectural patterns. The application is structured to be scalable, maintainable, and follows the Angular Style Guide.

## Folder Structure

```
src/app/
├── core/                          # Singleton services, guards, interceptors
│   ├── guards/                    # Route guards (AuthGuard, etc.)
│   ├── interceptors/              # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   ├── loader.interceptor.ts
│   │   └── index.ts
│   ├── services/                  # Singleton services
│   │   ├── auth.service.ts
│   │   ├── http.service.ts
│   │   ├── loader.service.ts
│   │   └── index.ts
│   └── core.module.ts
│
├── shared/                        # Reusable components, pipes, directives
│   ├── components/                # Reusable components
│   │   ├── loader/
│   │   ├── modal/
│   │   └── button/
│   ├── pipes/                     # Reusable pipes
│   │   └── safe.pipe.ts
│   ├── directives/                # Reusable directives
│   │   └── highlight.directive.ts
│   └── shared.module.ts
│
├── features/                      # Feature modules (lazy loaded)
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard-routing.module.ts
│   │   ├── components/
│   │   │   └── dashboard.component.ts/html/scss
│   │   └── services/
│   ├── patients/
│   │   ├── patients.module.ts
│   │   ├── patients-routing.module.ts
│   │   ├── components/
│   │   ├── services/
│   │   │   └── patient.service.ts
│   │   └── models/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users-routing.module.ts
│   │   └── ...
│   ├── facilities/
│   ├── mmu/
│   ├── compliance/
│   └── admin/
│
├── layouts/                       # Layout components
│   └── app-layout/
│       ├── app-layout.component.ts
│       ├── app-layout.component.html
│       └── app-layout.component.scss
│
├── environments/                  # Environment configuration
│   ├── environment.ts
│   └── environment.prod.ts
│
├── app.config.ts                  # Application configuration
├── app.routes.ts                  # Route definitions
└── main.ts                        # Application entry point
```

## Core Module

The Core Module contains singleton services that should only be instantiated once.

### Services

#### HttpService (Generic HTTP Service)

Generic wrapper over Angular HttpClient with built-in features:

```typescript
// GET request
this.http.get<User>('/users', {
  params: { page: '1', limit: '10' },
  showLoader: true,
  headers: customHeaders
}).subscribe(response => { ... });

// POST request
this.http.post<User>('/users', userData, {
  showLoader: true
}).subscribe(response => { ... });

// PUT request
this.http.put<User>('/users/1', updatedData).subscribe(...);

// PATCH request
this.http.patch<User>('/users/1', partialData).subscribe(...);

// DELETE request
this.http.delete<void>('/users/1').subscribe(...);
```

**Features:**
- Automatic loader management
- Centralized error handling
- Dynamic headers and query params
- Strongly typed responses
- Request/response interceptors

#### LoaderService

Manages global loader state:

```typescript
// Show loader
this.loaderService.show();

// Hide loader
this.loaderService.hide();

// Subscribe to loader state
this.loaderService.loader$.subscribe(isLoading => {
  // Update UI
});

// Check current state
const isLoading = this.loaderService.isLoading();

// Reset loader
this.loaderService.reset();
```

#### AuthService

Authentication service managing user state and authentication:

```typescript
// Get current user
const user = this.authService.getCurrentUser();

// Subscribe to user changes
this.authService.currentUser$.subscribe(user => { ... });

// Login/Logout handled through this service
```

### HTTP Interceptors

Three interceptors handle cross-cutting concerns:

1. **AuthInterceptor** - Injects authentication tokens into requests
2. **LoaderInterceptor** - Controls loader visibility for HTTP requests
3. **ErrorInterceptor** - Centralizes error handling and logging

## Shared Module

Contains reusable components, pipes, and directives that multiple features use.

### Adding Reusable Components

```typescript
// 1. Create component with separate files
src/app/shared/components/my-component/
├── my-component.component.ts
├── my-component.component.html
└── my-component.component.scss

// 2. Declare in shared.module.ts
declarations: [MyComponentComponent]
exports: [MyComponentComponent]

// 3. Use in other modules
imports: [SharedModule]
```

## Feature Modules

Feature modules are lazy-loaded and follow a consistent structure.

### Creating a New Feature Module

```typescript
// 1. Create folder structure
src/app/features/my-feature/
├── my-feature.module.ts
├── my-feature-routing.module.ts
├── components/
│   └── my-feature.component.ts/html/scss
├── services/
│   └── my-feature.service.ts
└── models/
    └── my-feature.model.ts

// 2. Create routing module
const routes: Routes = [
  {
    path: '',
    component: MyFeatureComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyFeatureRoutingModule {}

// 3. Create feature module
@NgModule({
  declarations: [MyFeatureComponent],
  imports: [CommonModule, MyFeatureRoutingModule, SharedModule]
})
export class MyFeatureModule {}

// 4. Add to main app.routes.ts
const routes: Routes = [
  {
    path: 'my-feature',
    loadChildren: () =>
      import('./features/my-feature/my-feature.module').then(
        m => m.MyFeatureModule
      )
  }
];
```

## Environment Configuration

Use environment files for configuration:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  features: {
    enableOfflineMode: true
  }
};

// Usage in services
import { environment } from '../../../environments/environment';

export class MyService {
  private apiUrl = environment.apiUrl;
}
```

## Component Architecture

Each component must follow this structure:

### Component File (component.ts)

```typescript
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class MyComponentComponent implements OnInit {
  constructor(private myService: MyService) {}

  ngOnInit(): void {
    // Initialization logic
  }

  // Component methods
}
```

### Template File (component.html)

```html
<div class="component-container">
  <!-- Component template -->
</div>
```

### Style File (component.scss)

```scss
.component-container {
  // Component styles
}
```

## HTTP Service Usage

### Basic GET Request

```typescript
this.httpService.get<UserResponse>('/users/1')
  .subscribe({
    next: (response) => {
      this.user = response;
    },
    error: (error) => {
      console.error('Error fetching user', error);
    }
  });
```

### POST with Options

```typescript
const userData = { name: 'John', email: 'john@example.com' };

this.httpService.post<UserResponse>('/users', userData, {
  showLoader: true,
  headers: new HttpHeaders({
    'X-Custom-Header': 'value'
  })
}).subscribe(response => {
  // Handle response
});
```

### Query Parameters

```typescript
this.httpService.get<UserListResponse>('/users', {
  params: {
    page: '1',
    limit: '20',
    sort: 'name'
  }
}).subscribe(response => {
  // Handle response
});
```

### Without Loader

```typescript
// Some requests don't need to show a loader
this.httpService.get<Data>('/autocomplete', {
  showLoader: false,
  params: { q: 'search-term' }
}).subscribe(...);
```

## State Management with RxJS

Follow RxJS best practices:

```typescript
// ✓ Good: Use BehaviorSubject for state
private dataSubject = new BehaviorSubject<Data | null>(null);
public data$ = this.dataSubject.asObservable();

// ✓ Good: Use async pipe in templates
<div>{{ data$ | async as data }}</div>

// ✓ Good: Use shareReplay for caching
public cachedData$ = this.http.get('/data').pipe(
  shareReplay(1)
);

// ✗ Avoid: Multiple subscriptions
this.data$.subscribe(...);
this.data$.subscribe(...);

// ✗ Avoid: Manual unsubscribe when async pipe works
```

## Routing

Routes are defined in `app.routes.ts` with lazy loading:

```typescript
const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            m => m.DashboardModule
          )
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.module').then(
            m => m.UsersModule
          )
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
```

## Error Handling

Errors are handled centrally through the ErrorInterceptor:

```typescript
// Errors are caught and logged in the interceptor
// Custom error handling in components:

this.myService.getData().subscribe({
  next: (data) => { /* handle success */ },
  error: (error) => {
    // Error already logged in interceptor
    // Handle component-specific error
    this.showErrorMessage(error.message);
  }
});
```

## Code Quality Standards

1. **TypeScript**: Use strict mode (`strict: true` in tsconfig.json)
2. **Typing**: Strongly type everything, avoid `any`
3. **Change Detection**: Use `ChangeDetectionStrategy.OnPush` on all components
4. **Naming**: Follow Angular Style Guide for naming conventions
5. **Organization**: One component per file
6. **Services**: Keep components thin, services fat (smart service pattern)

### File Naming Conventions

```
component.ts          // Component class
component.html        // Template
component.scss        // Styles
component.spec.ts     // Tests
service.ts            // Service class
service.spec.ts       // Service tests
model.ts              // Data model interfaces
```

## Testing

### Component Test Example

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Service Test Example

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Performance Optimization

1. **Lazy Loading**: All feature modules are lazy loaded
2. **Change Detection**: Use OnPush strategy
3. **Unsubscribe**: Use async pipe or unsubscribe on destroy
4. **Bundle Size**: Tree-shake unused code

## Dependencies & Versions

- Angular 20+
- RxJS 7+
- TypeScript 5+
- Bootstrap Icons for icons
- SCSS for styling

## Troubleshooting

### Module Not Found
Ensure the module is properly declared and exported in its parent module.

### Service Not Provided
Make sure singleton services are provided in CoreModule or marked with `providedIn: 'root'`.

### HTTP Requests Not Showing Loader
The loader is automatically managed by the HttpService. Pass `showLoader: true` (default) to enable it.

### Styling Not Applied
Ensure component uses styleUrls (or inline styles in rare cases). Check CSS specificity and inheritance.

## Best Practices Checklist

- [ ] Component uses separate files for template and styles
- [ ] Component uses ChangeDetectionStrategy.OnPush
- [ ] All types are strongly typed (no `any`)
- [ ] Reusable components are in SharedModule
- [ ] Services are injectable and follow DI pattern
- [ ] Routes use lazy loading
- [ ] HTTP requests use generic HttpService
- [ ] Error handling is implemented
- [ ] Unit tests are written
- [ ] Documentation is updated

## Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [RxJS Best Practices](https://rxjs.dev/)
- [Angular Performance Guide](https://angular.io/guide/performance-best-practices)
