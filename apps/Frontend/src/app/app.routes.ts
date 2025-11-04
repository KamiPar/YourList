import { Route } from '@angular/router';
import { AuthLayoutComponent } from '@your-list/shared/ui';


export const appRoutes: Route[] = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('@your-list/Frontend/features/feature-login').then(
        (r) => r.authRoutes
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'lists',
    // canActivate: [authGuard], // TODO: Implement and import AuthGuard
    loadComponent: () =>
      import('@your-list/Frontend/features/feature-lists').then(
        (c) => c.ListViewComponent
      ),
  },
  {
    path: 'lists/:id',
    // canActivate: [authGuard], // TODO: Implement and import AuthGuard
    loadComponent: () =>
      import('@your-list/Frontend/features/feature-lists-details').then(
        (c) => c.ListDetailsView
      ),
  },
];
