import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SettingsIconComponent } from './settings-icon/settings-icon.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { RouterModule } from '@angular/router';
import { LoadingComponent } from './loading/loading.component';
import { EmptyListComponent } from './empty-list/empty-list.component';



@NgModule({
  declarations: [
    SettingsIconComponent,
    SettingsListComponent,
    LoadingComponent,
    EmptyListComponent
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
  ],
  entryComponents: [SettingsListComponent]
})
export class SharedModule { }
