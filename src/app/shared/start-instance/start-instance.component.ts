import { Component, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-start-instance',
  templateUrl: './start-instance.component.html',
  styleUrls: ['./start-instance.component.scss']
})
export class StartInstanceComponent {
  @Input() instanceName = '';
  @Input() allContacts;
  public selectedContacts = [];
  public title = '';
  @ViewChild('titleInput', { static: false }) titleInput: any;

  @Input() startInstance;
  @Input() closeInstance;

  constructor() {}

  ionViewDidEnter() {
    this.titleInput.setFocus();
  }

  async close(startInstance = false) {
    return startInstance
      ? this.startInstance(this.title, this.selectedContacts)
      : this.closeInstance();
  }
}
