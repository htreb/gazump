import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { ContactService } from 'src/app/services/contact.service';
import { AlertController, ToastController } from '@ionic/angular';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss']
})
export class ContactsPage implements OnInit {

  addContactEmail: FormControl;
  allContacts$ = this.contactService.getUsersContacts();
  receivedRequests$ = this.contactService.getReceivedRequests();
  sentRequests$ = this.contactService.getSentRequests();
  private warningToast;

  constructor(
    private contactService: ContactService,
    private alertCtrl: AlertController,
    private groupService: GroupService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.addContactEmail = new FormControl('', [
      Validators.required,
      // the below regex is used over the Validators.email as this prevents emails like '2@2' from being valid
      Validators.pattern(/^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/)
    ]);
  }

  ionViewWillEnter() {
    this.groupService.showGroupMenuItems = false;
  }

  ionViewWillLeave() {
    this.groupService.showGroupMenuItems = true;
  }

  async showWarningToast(message: string) {
    if (!message) {
      return;
    }
    if (this.warningToast) {
      this.warningToast.dismiss();
    }
    this.warningToast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger'
    });
    this.warningToast.present();
  }

  async sendContactRequest() {
    const email = this.addContactEmail.value.trim();
    if (!this.addContactEmail.valid) {
      // can be called from an enter press so check validity here
      return;
    }

    this.addContactEmail.setValue('');
    try {
      await this.contactService.sendRequest(email);
    } catch (err) {
      if (err) {
        this.showWarningToast(err.message);
      }
      this.addContactEmail.setValue(email);
    }
  }

  async cancelSentRequest(request) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to cancel your contact request to:
                <br><br>
                <b>${request.accepterEmail}?</b>`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.contactService.cancelSentRequest(request);
          }
        }
      ]
    });
    await alert.present();
  }

  acceptContactRequest(user: any) {
    this.contactService.acceptContactRequest(user);
  }

  async declineContactRequest(request: any) {
    console.log('decline Request', request);
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to decline the contact request from:
                <br><br>
                <b>${request.requesterEmail}?</b>`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.contactService.declineContactRequest(request);
          }
        }
      ]
    });
    await alert.present();
  }
}
