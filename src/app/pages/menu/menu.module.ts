import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: '',
        loadChildren: () => import('../list-groups/list-groups.module').then(m => m.ListGroupsPageModule)
      },
      {
        path: 'group/:groupId/boards',
        loadChildren: () => import('../board-tabs/board-tabs.module').then(m => m.BoardTabsPageModule)
      },
      {
        path: 'group/:groupId/chats',
        loadChildren: () => import('../list-chats/list-chats.module').then(m => m.ListChatsPageModule)
      },
      { path: 'group/:groupId', redirectTo: 'group/:groupId/boards', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
