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
import { FormsModule } from '@angular/forms';
import { StartInstanceComponent } from './start-instance/start-instance.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { MembersDetailPipe } from './pipes/members-detail.pipe';
import { ContactPickerComponent } from './contact-picker/contact-picker.component';
import { TicketTitlePipe } from './pipes/ticket-title.pipe';



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
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    AutosizeModule,
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
  ],
  entryComponents: [
    SettingsListComponent,
    TextComponent,
    StartInstanceComponent,
    ContactPickerComponent,
  ]
})
export class SharedModule { }
