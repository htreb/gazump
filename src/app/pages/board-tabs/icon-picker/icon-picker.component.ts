import { Component, Input } from '@angular/core';
import { icons } from '../icon-picker/icon-list';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss'],
})
export class IconPickerComponent {

  icons = icons;
  @Input() currentIcon;
  @Input() callback;

  constructor() { }

  iconPicked(icon) {
    if (typeof this.callback === 'function') {
      this.callback(icon);
    }
  }
}
