import {
  Component,
  OnInit,
  ViewChild,
  Input,
  AfterViewChecked
} from '@angular/core';
import { IonContent, ModalController, PopoverController } from '@ionic/angular';
import { ChatService } from 'src/app/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { TicketPickerComponent } from '../ticket-picker/ticket-picker.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @Input() chatId;

  public chat$: Observable<any>;
  public currentUserId = this.auth.currentUser.value.id;
  public message = '';
  private atBottom = true;

  constructor(
    private auth: AuthService,
    private chatService: ChatService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
  ) {}

  ngOnInit() {
    this.chat$ = this.chatService.subToOneChat(this.chatId);
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
          chat.members[senderId].name) ||
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
    const msg = this.message; // save the message so can reload it if it fails to send
    if (!this.message.trim()) {
      // if no message don't try to send it
      return;
    }
    this.message = ''; // clear message straight away to keep app responsive
    try {
      await this.chatService.addChatMessage(this.chatId, msg);
    } catch (err) {
      console.log('failed to send chat message', err);
      this.message = msg;
    }
  }


  async linkSomething(ev: any) {
    const popover = await this.popoverController.create({
      component: TicketPickerComponent,
      event: ev,
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();

    if (data && data.tickets && data.tickets.length) {
      console.log(`Attach these tickets`, data.tickets);
    }
  }

}
