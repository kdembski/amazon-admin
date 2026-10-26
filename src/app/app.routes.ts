import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/overview/overview').then((m) => m.Overview),
      },
      {
        path: 'scrapers',
        loadComponent: () => import('./features/scrapers/scrapers').then((m) => m.Scrapers),
      },
    ],
  },
];
