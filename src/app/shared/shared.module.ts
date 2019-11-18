import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { RouterModule } from '@angular/router';
import { LoadingComponent } from './loading/loading.component';
import { EmptyListComponent } from './empty-list/empty-list.component';
import { TipComponent } from './tip/tip.component';
import { TextComponent } from './text/text.component';
import { AutosizeModule } from 'ngx-autosize';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StartInstanceComponent } from './start-instance/start-instance.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { MembersDetailPipe } from './pipes/members-detail.pipe';
import { ContactPickerComponent } from './contact-picker/contact-picker.component';
import { TicketTitlePipe } from './pipes/ticket-title.pipe';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { SlidingListComponent } from './sliding-list/sliding-list.component';
import { SharedDirectivesModule } from '../directives/shared-directives.module';


@NgModule({
  declarations: [
    SettingsIconComponent,
    SettingsListComponent,
    LoadingComponent,
    EmptyListComponent,
    TipComponent,
    TextComponent,
    StartInstanceComponent,
    TruncatePipe,
    MembersDetailPipe,
    ContactPickerComponent,
    TicketTitlePipe,
    TicketDetailComponent,
    SlidingListComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    AutosizeModule,
    ReactiveFormsModule,
    SharedDirectivesModule
  ],
  exports: [
    SettingsIconComponent,
    LoadingComponent,
    EmptyListComponent,
    TipComponent,
    TextComponent,
    StartInstanceComponent,
    TruncatePipe,
    MembersDetailPipe,
    ContactPickerComponent,
    AutosizeModule,
    TicketTitlePipe,
    TicketDetailComponent,
    SlidingListComponent,
  ],
  entryComponents: [
    SettingsListComponent,
    TextComponent,
    StartInstanceComponent,
    ContactPickerComponent,
    TicketDetailComponent
  ]
})
export class SharedModule { }
