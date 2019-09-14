import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  @Input() details;
  @Input() completedBy;
  @Input() states;
  public ticketForm: FormGroup;
  public linkedChatsTip = `These are the chats which mention this ticket. Only chats you are a member of will appear here.`;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {}

  ngOnInit() {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      completedBy: [''],
      // state: [''] TODO hook this up so it works and moves the card
    });

    this.ticketForm.patchValue(this.details.ticket);
  }

  closePage(saveTicket = false) {
    this.modalCtrl.dismiss({
      saveTicket,
      ticketDetails: this.ticketForm.value
    });
  }

  // TODO store these colors in an appropriate place on the db (map maybe with the completedBy);
  getCompletedByColor(person: string) {
    const colors = {
      'Sellers Solicitors': 'primary',
      'Buyers Solicitors': 'danger',
      'Estate Agents': 'tertiary',
      Sellers: 'success',
      Buyers: 'warning',
      Council: 'danger',
      Other: 'success'
    };
    return colors[person];
  }
}
