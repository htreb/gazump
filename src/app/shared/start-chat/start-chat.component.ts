import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ContactService } from 'src/app/services/contact.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.scss'],
})
export class StartChatComponent implements OnInit {

  @Input() closeStartChat;
  @Input() showNewChat;
  public chatTitle = '';
  public selectedContacts: any = [];
  contacts$;

  constructor(
    private modalCtrl: ModalController,
    private contactService: ContactService,
    private chatService: ChatService,
  ) { }

  ngOnInit() {
    this.contacts$ = this.contactService.getUsersContacts();
  }

  async closePage(startChat = false) {
    if (startChat) {
      const newChat = await this.chatService.startChat(this.chatTitle, this.selectedContacts);
      await this.showNewChat(newChat.id);
      this.closeStartChat();
    }
    this.closeStartChat();
  }

  contactSelected(ev, contact) {
    if (ev.detail.checked) {
      this.selectedContacts.push(contact);
      // remove any duplicates
      return (this.selectedContacts = [...new Set(this.selectedContacts)]);
    }
    this.selectedContacts = this.selectedContacts.filter(c => c.id !== contact.id);
  }

}
