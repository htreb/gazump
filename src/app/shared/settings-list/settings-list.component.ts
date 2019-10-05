import { Component, Input, OnInit, OnDestroy } from '@angular/core';

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
export class SettingsListComponent implements OnInit, OnDestroy {

  @Input() closePopover;
  @Input() settingsOptions;
  newSettingsOptions;
  changesSub;

  constructor() {}

  ngOnInit(): void {
    this.changesSub = this.newSettingsOptions.subscribe(options => {
      this.settingsOptions = options;
    });
  }
  ngOnDestroy(): void {
    this.changesSub.unsubscribe();
  }

  onSettingClicked(setting) {
    if (typeof this.closePopover === 'function') {
      this.closePopover();
    }
    if (typeof setting.func === 'function') {
      setting.func();
    }
  }
}
