import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.module').then(m => m.ContactsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['USER', 'ADMIN']
    },
  },
  { path: 'groups',
    loadChildren: () => import('./pages/list-groups/list-groups.module').then(m => m.ListGroupsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['USER', 'ADMIN']
    }
  },
  // if empty try to take them to the groups, if not signed in the auth guard will take them to login
  { path: '', redirectTo: 'groups', pathMatch: 'full' },
  { path: '**', redirectTo: 'groups' } // TODO 404 page? for now just take them to the groups page
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
