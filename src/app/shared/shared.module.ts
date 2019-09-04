import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    SettingsIconComponent,
    SettingsListComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
  ],
  exports: [
    SettingsIconComponent
  ],
  entryComponents: [SettingsListComponent]
})
export class SharedModule { }
