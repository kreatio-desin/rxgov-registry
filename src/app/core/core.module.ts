import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTOR } from '@angular/common/http';

// Services
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader.service';
import { HttpService } from './services/http.service';

// Interceptors
import { LoaderInterceptor, ErrorInterceptor, AuthInterceptor } from './interceptors';

/**
 * Core Module
 * Contains singleton services and HTTP interceptors
 * Should be imported only once in AppModule
 */
@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    AuthService,
    LoaderService,
    HttpService,
    {
      provide: HTTP_INTERCEPTOR,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTOR,
      useClass: LoaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTOR,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
