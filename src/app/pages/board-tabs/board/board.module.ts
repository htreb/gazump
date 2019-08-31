import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BoardPage } from './board.page';
import { NgxSmoothDnDModule } from 'ngx-smooth-dnd';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

const routes: Routes = [
  {
    path: '',
    component: BoardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxSmoothDnDModule,
  ],
  declarations: [BoardPage, TicketDetailComponent],
  entryComponents: [TicketDetailComponent] // since the ticket is loaded dynamically it needs to be here too
})
export class BoardPageModule {}
