import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SettingsListComponent } from '../settings-list/settings-list.component';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
})
export class SettingsIconComponent {

  constructor(
    private popoverController: PopoverController,
  ) { }

  async showSettingsOptions(ev: any) {
    const popover = await this.popoverController.create({
      component: SettingsListComponent,
      event: ev,
    });
    return await popover.present();
  }

}
