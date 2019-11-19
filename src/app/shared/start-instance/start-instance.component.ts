import { Component, Input, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';

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
  @Input() admins = [];
  @Input() title = '';
  @Input() onSaved;
  @Input() onClosed;
  @Input() ctaText;
  @Input() disabled;

  constructor(private alertCtrl: AlertController) {}

  async ionViewDidEnter() {
    this.titleInput.setFocus();
    if (this.disabled) {
      const alert = await this.alertCtrl.create({
        message: 'You must be an Admin to edit.',
        buttons: ['OK']
      });
      return alert.present();
    }
  }

  async close(saved = false) {
    if (this.disabled && saved) {
      return;
    }
    return saved
      ? this.onSaved(this.title, this.selectedContacts, this.admins)
      : this.onClosed();
  }
}
