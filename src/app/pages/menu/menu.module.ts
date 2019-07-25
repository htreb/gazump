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
        loadChildren: '../board/board.module#BoardPageModule'
      },
      {
        path: 'chat',
        loadChildren: '../chat/chat.module#ChatPageModule'
      },
      {
        path: 'ticket',
        loadChildren: '../ticket/ticket.module#TicketPageModule'
      },
      {
        path: 'chats',
        loadChildren: '../chats/chats.module#ChatsPageModule'
      },
      {
        path: 'chats/start',
        loadChildren: '../start-chat/start-chat.module#StartChatPageModule'
      },
      {
        path: 'profile',
        loadChildren: '../profile/profile.module#ProfilePageModule'
      }
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
