import { Component, OnInit, Input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { GroupService } from 'src/app/services/group.service';
import { Router } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit {
  public ticketForm: FormGroup;
  public linkedChatsTip = `These are the chats which mention this ticket. Only chats you are a member of will appear here.`;
  public linkedChats$;
  public currentTicketSnippet;
  public completedBy;
  @Input() ticketId;
  @Input() currentStateId;
  @Input() boardId;
  @Input() dismiss = () => {};

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private groupService: GroupService,
    private boardService: BoardService,
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

    if (this.ticketId) {
      // Editing a ticket which exists;
      const ticketDetails = this.boardService.findTicketPositionDetails(this.ticketId);
      this.currentTicketSnippet = ticketDetails.ticketSnippet;
      this.currentStateId = ticketDetails.currentStateId;
      this.boardId = ticketDetails.currentBoardId;

      this.ticketForm.patchValue(this.currentTicketSnippet);
      this.linkedChats$ = this.chatService.findChatsWhichMentionTicket(this.ticketId);
    }
    this.completedBy = this.boardService.getCompletedBy(this.boardId);
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

  async saveTicket() {
    if (this.ticketId) {
      // updating a ticket which already exists
      await this.boardService.updateTicketSnippet(
        this.ticketForm.value
      );
    } else {
      await this.boardService.addTicketSnippet(
        this.ticketForm.value,
        this.currentStateId,
        this.boardId,
      );
    }

    this.dismiss();
  }

  async deleteTicket() {
    const alert = await this.alertCtrl.create({
      message: `Are you sure you want to delete this ticket?
                <br><br>
                This cannot be undone.`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.boardService.deleteTicketSnippet(this.ticketId);
            this.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }
}
