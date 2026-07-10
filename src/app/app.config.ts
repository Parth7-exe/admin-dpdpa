import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { CategoryService } from './core/category.service';

function initCategories(categoryService: CategoryService) {
  return () => categoryService.loadAll().toPromise().catch(() => {});
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: initCategories,
      deps: [CategoryService],
      multi: true,
    },
  ],
};
