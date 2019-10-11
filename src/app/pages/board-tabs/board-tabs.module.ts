import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BoardTabsPage } from './board-tabs.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { BoardPage } from './board/board.page';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BoardDetailComponent } from './board-detail/board-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BoardTabsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    DragDropModule,
    ReactiveFormsModule,
  ],
  declarations: [
    BoardTabsPage,
    BoardPage,
    BoardDetailComponent
  ],
  entryComponents: [
    // since these are loaded dynamically without the router they need to be here too
    BoardDetailComponent
  ]

})
export class BoardTabsPageModule {}
