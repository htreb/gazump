import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BoardTabsPage } from './board-tabs.page';
import { BoardComponent } from './Old board component/board.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
    DragDropModule
  ],
  declarations: [BoardTabsPage, BoardComponent]
})
export class BoardTabsPageModule {}
