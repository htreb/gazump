import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ContactService } from 'src/app/services/contact.service';
import { ChatService } from 'src/app/services/chat.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.scss']
})
export class StartChatComponent implements OnInit {
  @Input() closeStartChat;
  @Input() showNewChat;
  @ViewChild('chatTitleInput', { static: false }) chatTitleInput: any;
  public chatTitle = '';
  public selectedContacts: any = [];
  searchTerm$ = new BehaviorSubject<string>('');
  filteredContacts$;

  constructor(
    private contactService: ContactService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.filteredContacts$ = combineLatest([
      // TODO should this be a behaviour subject to hold all the contacts?
      this.contactService.getGroupContacts(),
      this.searchTerm$
    ]).pipe(
      map(([allContacts, searchTerm]) => {
        return this.filterShowingContacts(allContacts, searchTerm);
      })
    );
  }

  ionViewDidEnter() {
    this.chatTitleInput.setFocus();
  }

  updateSearchTerm(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  filterShowingContacts(allContacts: any, searchTerm: string) {
    if (allContacts.loading) {
      return allContacts;
    }
    searchTerm = searchTerm.toLowerCase();
    const contacts = JSON.parse(JSON.stringify(allContacts));
    return contacts.filter((contact: any) => {
      return (
        contact.userName.toLowerCase().indexOf(searchTerm) > -1 ||
        contact.email.toLowerCase().indexOf(searchTerm) > -1
      );
    });
  }

  async closePage(startChat = false) {
    if (startChat) {
      const newChat = await this.chatService.startChat(
        this.chatTitle,
        this.selectedContacts
      );
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
    this.selectedContacts = this.selectedContacts.filter(
      c => c.id !== contact.id
    );
  }
}
