import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BoardTabsPage } from './board-tabs.page';
import { BoardComponent } from './board/board.component';
import { SortableDirective } from './sortable.directive';

const routes: Routes = [
  {
    path: '',
    component: BoardTabsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BoardTabsPage, BoardComponent, SortableDirective]
})
export class BoardTabsPageModule {}
