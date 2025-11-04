import { Route } from '@angular/router';
import { FeatureLogin } from './feature-login/feature-login';
import { FeatureRegister } from '@your-list/Frontend/features/feature-register';


export const authRoutes: Route[] = [
  {
    path: 'login',
    component: FeatureLogin,
  },
  {
    path: 'register',
    component: FeatureRegister,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
