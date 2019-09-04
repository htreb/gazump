import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BoardTabsPage } from './board-tabs.page';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'board',
    component: BoardTabsPage,
    children: [
      {
        path: ':boardId',
        loadChildren: () => import('./board/board.module').then(m => m.BoardPageModule),
      }
    ],
  },
  {
    path: '',
    redirectTo: 'board',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [BoardTabsPage]
})
export class BoardTabsPageModule {}
