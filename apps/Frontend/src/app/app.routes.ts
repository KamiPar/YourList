import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'lists',
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
