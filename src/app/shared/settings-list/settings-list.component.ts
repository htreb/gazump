import { Component, Input } from '@angular/core';

export interface SettingsOption {
  title: string;
  icon: string;
  func(): any;
}

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
})
export class SettingsListComponent {

  @Input() closePopover;
  @Input() settingsOptions;

  constructor() {}

  onSettingClicked(setting) {
    if (typeof this.closePopover === 'function') {
      this.closePopover();
    }
    if (typeof setting.func === 'function') {
      setting.func();
    }
  }
}
