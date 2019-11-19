import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContactService } from 'src/app/services/contact.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-contact-picker',
  templateUrl: './contact-picker.component.html',
  styleUrls: ['./contact-picker.component.scss'],
})
export class ContactPickerComponent implements OnInit {

  @Input() allContacts = false;
  @Input() selectedContacts: any = [];
  @Input() admins: any = [];
  @Input() disabled;
  membersTip: string;
  searchTerm$ = new BehaviorSubject<string>('');
  filteredContacts$;

  constructor(
    private contactService: ContactService
  ) { }

  ngOnInit() {
    this.membersTip = this.allContacts ? 'You can pick from any of your contacts. Members who are not your contacts will not show.' :
    'You can only choose from your contacts who are also members of this group. Members who are not your contacts will not show.';
    const contactSource = this.allContacts ? 'getUsersContacts' : 'getGroupContacts';
    this.filteredContacts$ = combineLatest([
      this.contactService[contactSource](),
      this.searchTerm$
    ]).pipe(
      map(([contactsBeforeFiltering, searchTerm]) => {
        return this.filterShowingContacts(contactsBeforeFiltering, searchTerm);
      })
    );
  }

  updateSearchTerm(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  filterShowingContacts(contactsBeforeFiltering: any, searchTerm: string) {
    if (contactsBeforeFiltering.loading) {
      return contactsBeforeFiltering;
    }
    searchTerm = searchTerm.toLowerCase();
    const contacts = JSON.parse(JSON.stringify(contactsBeforeFiltering));
    return contacts.filter((contact: any) => {
      return (
        contact.userName.toLowerCase().indexOf(searchTerm) > -1 ||
        contact.email.toLowerCase().indexOf(searchTerm) > -1
      );
    })/* .sort((a, b) => selectedContacts.includes(a.id) ? -1 : 1 ) */;
  }

  contactSelected(selected, contactId) {
    if (this.disabled) {
      return;
    }
    const idx = this.selectedContacts.indexOf(contactId);
    if (selected && idx === -1) {
      this.selectedContacts.push(contactId);
    } else if (!selected && idx > -1) {
      this.selectedContacts.splice(idx, 1);
      this.toggleAdmin(contactId, false);
    }
  }

  toggleAdmin(contactId, force?) {
    if (this.disabled) {
      return;
    }
    const idx = this.admins.indexOf(contactId);
    const shouldSelect = force === undefined ? idx === -1 : force;
    if (shouldSelect && idx === -1) {
      this.admins.push(contactId);
      this.contactSelected(true, contactId);
    } else if (!shouldSelect && idx > -1) {
      this.admins.splice(idx, 1);
    }
  }
}
