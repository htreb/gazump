import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SettingsListComponent } from '../settings-list/settings-list.component';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss']
})
export class SettingsIconComponent implements OnChanges {
  @Input() settingsOptions;
  private popover: HTMLIonPopoverElement;

  constructor(private popoverController: PopoverController) {}

  ngOnChanges(changes: SimpleChanges): void {
    // close the settings if the options have changed.
    if (
      changes.settingsOptions && changes.settingsOptions.previousValue &&
      changes.settingsOptions.currentValue.length !==
      changes.settingsOptions.previousValue.length
    ) {
      this.closeSettings();
    }
  }

  async showSettings(ev: any) {
    this.popover = await this.popoverController.create({
      component: SettingsListComponent,
      event: ev,
      componentProps: {
        closePopover: this.closeSettings,
        settingsOptions: this.settingsOptions
      }
    });
    return await this.popover.present();
  }

  @HostListener('window:resize', ['$event'])
  closeSettings(ev?: any) {
    if (this.popover) {
      this.popover.dismiss();
    }
  }
}
