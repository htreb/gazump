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
      { path: '', redirectTo: 'board', pathMatch: 'full' },
      {
        path: 'board',
        loadChildren: () => import('../board/board.module').then(m => m.BoardPageModule)
      },
      {
        path: 'ticket',
        loadChildren: () => import('../ticket/ticket.module').then(m => m.TicketPageModule)
      },
      {
        path: 'chats',
        loadChildren: () => import('../list-chats/list-chats.module').then(m => m.ListChatsPageModule)
      },
      {
        path: 'chats/create',
        loadChildren: () => import('../create-chat/create-chat.module').then(m => m.CreateChatPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'chat/:id',
        loadChildren: () => import('../chat/chat.module').then(m => m.ChatPageModule)
      },
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
