import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [SettingsIconComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [
    SettingsIconComponent
  ]
})
export class SharedModule { }
