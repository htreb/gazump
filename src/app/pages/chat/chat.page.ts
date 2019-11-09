import {
  Component,
  OnInit,
  ViewChild,
  Input,
  AfterViewChecked,
  ViewChildren,
  Renderer2
} from '@angular/core';
import { IonContent, PopoverController, ModalController, AlertController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { TicketPickerComponent } from './ticket-picker/ticket-picker.component';
import { TicketDetailOrBoardComponent } from './ticket-detail-or-board/ticket-detail-or-board.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { ContactService } from 'src/app/services/contact.service';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { StartInstanceComponent } from 'src/app/shared/start-instance/start-instance.component';
import { take } from 'rxjs/operators';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, AfterViewChecked {
  @Input() messageIds: string[] = [];
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChildren('chatMessage') messageElements: any;
  @ViewChild('typeMessageArea', { static: false }) typeMessageArea: any;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'Edit Chat',
      icon: 'create',
      func: () => this.editChat(),
    }
  ];
  private chatId = '';
  public chat$: Observable<any>;
  public currentUserId = this.auth.userId$.value;
  public message = '';
  public linkedTickets = [];
  private atBottom = true;
  private scrolledToHighlightedMessage = false;
  private scrollEl;

  constructor(
    public groupService: GroupService,
    private auth: AuthService,
    private chatService: ChatService,
    private popoverController: PopoverController,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private contactService: ContactService,
    private modalController: ModalController,
    private boardService: BoardService,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.chatId = params.get('chatId');
      this.chat$ = this.chatService.subToOneChat(this.chatId);
    });

    this.route.queryParams.subscribe((queries: any) => {
      const messageIds = queries.messageIds;
      if (messageIds) {
        this.messageIds = messageIds.split(',');
        setTimeout( _ => {
          this.scrollToMessages(this.messageIds);
        }, 1000);
      }
    });
  }

  ionViewDidEnter() {
    this.focusTypingArea();
  }

  ngAfterViewChecked(): void {
    if (this.atBottom) {
      this.scrollToBottom();
    }
  }

  focusTypingArea() {
    if (this.typeMessageArea) {
      this.typeMessageArea.setFocus();
    }
  }

  scrollToMessages(messageIds: string[]) {
    this.messageElements.forEach(async msg => {
      if (this.messageIds.indexOf(msg.el.id) > -1) {
        if (!this.scrolledToHighlightedMessage) {
          this.scrolledToHighlightedMessage = true;
          this.atBottom = false;
          const scrollEl = await this.content.getScrollElement();
          const centeredMsgTop = msg.el.offsetTop + (msg.el.offsetHeight / 2) - (scrollEl.offsetHeight / 2);
          await this.content.scrollToPoint(0, centeredMsgTop, 1000);
          this.renderer.addClass(msg.el, 'shake');
          setTimeout(() => {
            this.renderer.removeClass(msg.el, 'shake');
          }, 1400);
        }
      }
    });
  }

  getMessages(chat: any) {
    if (!chat.messages) {
      return false;
    }

    const messages = Object.entries(chat.messages).map(([key, value]: any) => ({
      ...value,
      id: key,
      senderName: this.contactService.getDetailsFromId(value.from).userName
    }));
    messages.sort((a: any, b: any) => {
      if (!a.createdAt) {
        return 1; // if no createdAt yet then message must be very new.
      }
      if (!b.createdAt) {
        return -1;
      }
      return a.createdAt.seconds - b.createdAt.seconds;
    });

    return messages.length ? messages : false;
  }

  messageTrackBy(index, message) {
    return message.id;
  }

  async onScrollStart() {
    // update the scrollEl so we can be sure we have for the scroll end
    // when getting it async in the onScrollEnd there's a race condition
    // with the afterViewChecked keeping the page at the bottom.
    this.scrollEl = await this.content.getScrollElement();
  }

  onScrollEnd(ev) {
    // if user is at bottom then keep screen scrolled to bottom.
    // if not (reading something further up) then do not auto scroll screen.
    this.atBottom = this.scrollEl.scrollHeight - this.scrollEl.scrollTop - this.scrollEl.offsetHeight <= 0;
  }

  scrollToBottom(duration = 0) {
    if (this.content) {
      this.content.scrollToBottom(duration);
    }
  }

  async sendMessage() {
    if (!this.message.trim()) {
      // if no message don't try to send it
      return;
    }
    // clear message and tickets straight away to keep app responsive
    const msg = this.message;
    const tickets = JSON.parse(JSON.stringify(this.linkedTickets));
    this.message = '';
    this.linkedTickets = [];
    try {
      await this.chatService.addChatMessage(this.chatId, msg, tickets);
    } catch (err) {
      console.log('failed to send chat message', err);
      this.message = msg;
      this.linkedTickets = tickets;
    }
    this.focusTypingArea();
  }

  async linkSomething(ev: any) {
    const initialSelectedTickets = JSON.parse(JSON.stringify(this.linkedTickets));
    const popover = await this.popoverController.create({
      component: TicketPickerComponent,
      componentProps: {
        selectedTickets: this.linkedTickets
      },
      event: ev,
      cssClass: 'picker',
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data && data.tickets) {
      this.linkedTickets = data.tickets;
    } else {
      this.linkedTickets = initialSelectedTickets;
    }
  }

  async onLinkedTicketClick(ev, ticketId) {

    const {
      currentBoardId,
      ticketSnippet
    } = this.boardService.findTicketPositionDetails(ticketId);

    if (!currentBoardId || !ticketSnippet) {
      const alert = await this.alertCtrl.create({
        message: 'Ticket has been deleted.',
        buttons: ['OK']
      });
      return alert.present();
    }

    const detailsOrBoard = await this.popoverController.create({
      component: TicketDetailOrBoardComponent,
      componentProps: {
        ticketId,
        dismiss,
      },
      event: ev,
    });
    function dismiss() {
      // reset this flag when leaving the chat view so we can scroll back to a ticket again
      this.scrolledToHighlightedMessage = false;
      detailsOrBoard.dismiss();
    }
    detailsOrBoard.present();
  }

  editChat() {
    this.chat$.pipe(take(1)).subscribe(async (chat) => {
      let editChatModal: HTMLIonModalElement;

      const onClosed = () => {
        if (typeof editChatModal.dismiss === 'function') {
          editChatModal.dismiss();
        }
      };

      const onSaved = async (title, contacts) => {
        onClosed();
        this.chatService.editChat(chat.id, title, contacts);
      };

      editChatModal = await this.modalController.create({
        component: StartInstanceComponent,
        componentProps: {
          onSaved,
          onClosed,
          header: 'Edit chat',
          ctaText: 'Save Changes',
          selectedContacts: chat.members,
          title: chat.title,
        }
      });

      return await editChatModal.present();
    });
  }
}
