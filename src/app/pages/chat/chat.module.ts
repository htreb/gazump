import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChatPage } from './chat.page';
import { TicketDetailOrBoardComponent } from './ticket-detail-or-board/ticket-detail-or-board.component';
import { TicketPickerComponent } from './ticket-picker/ticket-picker.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ChatPage,
    TicketPickerComponent,
    TicketDetailOrBoardComponent,
  ],
  entryComponents: [
    TicketDetailOrBoardComponent,
    TicketPickerComponent,
  ]
})
export class ChatPageModule {}
