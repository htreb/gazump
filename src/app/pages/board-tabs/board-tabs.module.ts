import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BoardTabsPage } from './board-tabs.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { BoardPage } from './board/board.page';
import { TicketDetailComponent } from './board/ticket-detail/ticket-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

const routes: Routes = [
  {
    path: 'board',
    component: BoardTabsPage,
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
    DragDropModule
  ],
  declarations: [BoardTabsPage, BoardPage, TicketDetailComponent],
  entryComponents: [TicketDetailComponent] // since the ticket is loaded dynamically it needs to be here too

})
export class BoardTabsPageModule {}
