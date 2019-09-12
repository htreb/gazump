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



@NgModule({
  declarations: [
    SettingsIconComponent,
    SettingsListComponent,
    LoadingComponent,
    EmptyListComponent,
    TipComponent,
    TextComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
  ],
  exports: [
    SettingsIconComponent,
    LoadingComponent,
    EmptyListComponent,
    TipComponent,
    TextComponent
  ],
  entryComponents: [SettingsListComponent, TextComponent]
})
export class SharedModule { }
