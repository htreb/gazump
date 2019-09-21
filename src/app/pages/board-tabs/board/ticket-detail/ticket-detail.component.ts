import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/chat.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  @Input() currentTicketSnippet;
  @Input() currentState;
  @Input() completedBy;
  @Input() allStates;
  public ticketForm: FormGroup;
  public linkedChatsTip = `These are the chats which mention this ticket. Only chats you are a member of will appear here.`;
  linkedChats$;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.linkedChats$ = this.chatService.findChatsWhichMentionTicket(
      this.currentTicketSnippet.id
    );

    this.ticketForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      completedBy: ['']
      // state: [''] TODO hook this up so it works and moves the card
    });

    this.ticketForm.patchValue(this.currentTicketSnippet);
  }

  closePage(saveTicket = false) {
    this.modalCtrl.dismiss({
      saveTicket,
      ticketFormValue: this.ticketForm.value
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
