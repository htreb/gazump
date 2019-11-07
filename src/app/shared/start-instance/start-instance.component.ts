import { Component, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-start-instance',
  templateUrl: './start-instance.component.html',
  styleUrls: ['./start-instance.component.scss']
})
export class StartInstanceComponent {
  @ViewChild('titleInput', { static: false }) titleInput: any;
  @Input() header = '';
  @Input() allContacts;
  @Input() selectedContacts = [];
  @Input() title = '';
  @Input() onSaved;
  @Input() onClosed;
  @Input() ctaText;

  constructor() {}

  ionViewDidEnter() {
    this.titleInput.setFocus();
  }

  async close(saved = false) {
    return saved
      ? this.onSaved(this.title, this.selectedContacts)
      : this.onClosed();
  }
}
