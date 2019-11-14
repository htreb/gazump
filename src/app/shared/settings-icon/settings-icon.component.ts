import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output
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
  @Output() newSettingsOptions = new EventEmitter(true);
  private popover: HTMLIonPopoverElement;

  constructor(private popoverController: PopoverController) {}

  ngOnChanges(changes: SimpleChanges): void {
    // update the setting list if settings options have changed.
    if (changes.settingsOptions && changes.settingsOptions.currentValue) {
      this.newSettingsOptions.emit(changes.settingsOptions.currentValue);
    }
  }

  async showSettings(ev: any) {
    this.popover = await this.popoverController.create({
      component: SettingsListComponent,
      event: ev,
      mode: 'md',
      componentProps: {
        closePopover: this.closeSettings,
        settingsOptions: this.settingsOptions,
        newSettingsOptions: this.newSettingsOptions,
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
