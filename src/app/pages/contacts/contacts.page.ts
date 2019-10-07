import { Component, OnInit } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { ContactService } from 'src/app/services/contact.service';
import { AlertController } from '@ionic/angular';
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

  constructor(
    private contactService: ContactService,
    private alertCtrl: AlertController,
    private groupService: GroupService,
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

  sendContactRequest() {
    const email = this.addContactEmail.value;
    this.addContactEmail.setValue('');
    try {
      this.contactService.sendRequest(email);
    } catch {
      this.addContactEmail.setValue(email);
    }
  }

  async cancelSentRequest(request) {
    console.log('cancel Request', request);
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to cancel your contact request to:
                <br><br>
                <b>${request.email}?</b>`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.contactService.cancelSentRequest(request.id);
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
                <b>${request.userName}?</b>`,
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
