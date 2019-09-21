import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.scss'],
})
export class StartChatComponent implements OnInit {

  public chatName = '';
  public selectedContacts: string[] = [];
  contacts$;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.contacts$ = of([
      {
        name: 'bob',
        id: 'bob123',
      },
      {
        name: 'colin',
        id: 'colin123',
      },
      {
        name: 'john',
        id: 'john123',
      },
      {
        name: 'pip',
        id: 'pip123',
      },
    ]);
  }

  closePage(startChat = false) {
    this.modalCtrl.dismiss({
      startChat,
      chatName: this.chatName,
      contacts: this.selectedContacts,
    });
  }

  contactSelected(ev, contact) {
    if (ev.detail.checked) {
      this.selectedContacts.push(contact.id);
      // remove any duplicates
      return (this.selectedContacts = [...new Set(this.selectedContacts)]);
    }
    this.selectedContacts = this.selectedContacts.filter(t => t !== contact.id);
  }

}
