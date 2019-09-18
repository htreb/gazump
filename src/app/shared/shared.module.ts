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
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from '@angular/forms';
import { TicketPickerComponent } from './ticket-picker/ticket-picker.component';



@NgModule({
  declarations: [
    SettingsIconComponent,
    SettingsListComponent,
    LoadingComponent,
    EmptyListComponent,
    TipComponent,
    TextComponent,
    ChatComponent,
    TicketPickerComponent,
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
    ChatComponent,
  ],
  entryComponents: [SettingsListComponent, TextComponent, ChatComponent, TicketPickerComponent]
})
export class SharedModule { }
