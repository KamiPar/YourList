import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'lists',
    // canActivate: [authGuard], // TODO: Implement and import AuthGuard
    loadComponent: () =>
      import('@your-list/Frontend/features/feature-lists').then(
        (c) => c.ListViewComponent
      ),
  },
];
