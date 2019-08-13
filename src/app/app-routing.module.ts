import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'groups', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'groups',
    loadChildren: () => import('./pages/list-groups/list-groups.module').then(m => m.ListGroupsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['USER', 'ADMIN']
    }
  },
  { path: '**', redirectTo: 'groups' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
