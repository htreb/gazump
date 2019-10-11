import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { GroupService } from 'src/app/services/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  public ticketForm: FormGroup;
  public linkedChatsTip = `These are the chats which mention this ticket. Only chats you are a member of will appear here.`;
  public linkedChats$;
  @Input() currentTicketSnippet;
  @Input() completedBy;
  @Input() dismiss;
  @Input() deleteTicket = () => {};

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private chatService: ChatService,
    private groupService: GroupService,
    private router: Router,
    private alertCtrl: AlertController,
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

    const closeAndNavToChat = ()  => {
      this.dismiss();
      this.router.navigate([
        '/',
        'group',
        this.groupService.currentGroupId,
        'chats',
        chatId
      ],
      { queryParams:
        { messageIds:
          messageIds.join(',')
        }
      });
    };

    if (this.ticketForm.dirty) {
      const alert = await this.alertCtrl.create({
        message: `You have unsaved changes are you sure you want to leave this page?`,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Ok',
            handler: closeAndNavToChat
          }
        ]
      });
      await alert.present();
    } else {
      closeAndNavToChat();
    }
  }
}
