import { Component, HostListener } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SettingsListComponent } from '../settings-list/settings-list.component';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
})
export class SettingsIconComponent {

  private popover: HTMLIonPopoverElement;
  constructor(
    private popoverController: PopoverController,
  ) { }

  async showSettings(ev: any) {
    this.popover = await this.popoverController.create({
      component: SettingsListComponent,
      event: ev,
      componentProps: {
        closePopover: this.closeSettings,
      }
    });
    return await this.popover.present();
  }

  @HostListener('window:resize', ['$event'])
  closeSettings(ev: any) {
    if (this.popover) {
      this.popover.dismiss();
    }
  }


}
