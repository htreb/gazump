import {
  Component,
  OnInit,
  ViewChild,
  Input,
  AfterViewChecked,
  ViewChildren
} from '@angular/core';
import { IonContent, ModalController, PopoverController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { TicketPickerComponent } from '../ticket-picker/ticket-picker.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @Input() chatId = '';
  @Input() messageIds: string[] = [];
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChildren('chatMessage') messageElements: any;
  @ViewChild('typeMessageArea', { static: false }) typeMessageArea: any;

  public chat$: Observable<any>;
  public currentUserId = this.auth.currentUser.value.id;
  public message = '';
  linkedTickets = [];
  private atBottom = true;
  private scrolledToHighlightedMessage = false;

  constructor(
    private auth: AuthService,
    private chatService: ChatService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
  ) {}

  ngOnInit() {
    this.chat$ = this.chatService.subToOneChat(this.chatId);

    if (this.messageIds.length) {
      setTimeout( _ => {
        this.messageElements.forEach(async msg => {
          if (this.messageIds.indexOf(msg.el.id) > -1) {
            if (!this.scrolledToHighlightedMessage) {
              this.scrolledToHighlightedMessage = true;
              this.atBottom = false;
              const scrollEl = await this.content.getScrollElement();
              const centeredMsgTop = msg.el.offsetTop + (msg.el.offsetHeight / 2) - (scrollEl.offsetHeight / 2);
              this.content.scrollToPoint(0, centeredMsgTop, 1000);
            }
          }
          });
      }, 500);
    }
  }

  ionViewDidEnter() {
    this.typeMessageArea.setFocus();
  }

  ngAfterViewChecked(): void {
    if (this.atBottom) {
      this.scrollToBottom();
    }
  }

  closePage() {
    this.modalCtrl.dismiss();
  }

  getMessages(chat: any) {
    if (!chat.messages) {
      return false;
    }

    function getSenderName(senderId: string) {
      return (
        (chat &&
          chat.members &&
          chat.members[senderId] &&
          chat.members[senderId].userName) ||
        'Unknown'
      );
    }
    const messages = Object.entries(chat.messages).map(([key, value]: any) => ({
      ...value,
      id: key,
      senderName: getSenderName(value.from)
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

  newDay(message, messageIndex, messages) {
    // console.log('newDay', message, messageIndex, messages);
    return null;
  }

  // if user is at bottom then keep screen scrolled to bottom.
  // if not (reading something further up) then do not auto scroll screen.
  async scrollEnd(ev) {
    // set to false now or it will have already snapped to the bottom before async gets the scrollEl.
    this.atBottom = false;
    const scrollEl = await this.content.getScrollElement();
    this.atBottom =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.offsetHeight <= 0;
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
  }

  async linkSomething(ev: any) {
    const initialSelectedTickets = JSON.parse(JSON.stringify(this.linkedTickets));
    const popover = await this.popoverController.create({
      component: TicketPickerComponent,
      componentProps: {
        selectedTickets: this.linkedTickets
      },
      event: ev,
      cssClass: 'ticket-picker',
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data && data.tickets) {
      this.linkedTickets = data.tickets;
    } else {
      this.linkedTickets = initialSelectedTickets;
    }

  }

}
