import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { ChatComponent } from 'src/app/shared/chat/chat.component';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  @Input() currentTicketSnippet;
  @Input() completedBy;
  public ticketForm: FormGroup;
  public linkedChatsTip = `These are the chats which mention this ticket. Only chats you are a member of will appear here.`;
  linkedChats$;
  @Input() deleteTicket = () => {};

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    this.ticketForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      completedBy: ['']
    });

    this.ticketForm.patchValue(this.currentTicketSnippet);
    this.linkedChats$ = this.chatService.findChatsWhichMentionTicket(
      this.currentTicketSnippet.id
    );

  }

  closePage(saveTicket = false) {
    this.modalCtrl.dismiss({
      saveTicket,
      ticketFormValue: this.ticketForm.value
    });
  }

  async openChat(chatId: string, messageIds?: string[]) {
    const chatModal = await this.modalCtrl.create({
      component: ChatComponent,
      cssClass: 'full-screen',
      showBackdrop: false,
      componentProps: {
        chatId,
        messageIds,
        closeChat,
      }
    });
    function closeChat() {
      chatModal.dismiss();
    }
    await chatModal.present();
    const { data } = await chatModal.onWillDismiss();
  }
}
