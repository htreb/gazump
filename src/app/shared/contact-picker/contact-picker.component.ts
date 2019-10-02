import { Component, OnInit, Input, HostListener } from '@angular/core';
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
  @Input() dismissPopover;
  @Input() selectedContacts: any = [];
  searchTerm$ = new BehaviorSubject<string>('');
  filteredContacts$;

  constructor(
    private contactService: ContactService
  ) { }

  ngOnInit() {
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
    });
  }

  contactSelected(ev, contact) {
    const idx = this.findContact(contact);
    if (ev.detail.checked && idx === -1) {
      this.selectedContacts.push(contact);
    } else if (!ev.detail.checked && idx > -1) {
      this.selectedContacts.splice(idx, 1);
    }
  }

  findContact(contact) {
    let idx = -1;
    this.selectedContacts.forEach((c, i) => {
      if (c.id === contact.id) {
        idx = i;
      }
    });
    return idx;
  }

  @HostListener('window:resize', ['$event'])
  closeContactPicker(ev: any = null, attachContacts = false) {
    this.dismissPopover({
      contacts: attachContacts && this.selectedContacts
    });
  }
}
