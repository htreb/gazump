import { Component, OnInit, ViewChild, Input, AfterViewChecked } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { ChatService } from 'src/app/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
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
  ) { }

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
    const messages = Object.entries(chat.messages).map(([key, value]) => ({id: key, ...value}));
    // TODO - I need a sort function here to order the messages by

    return false;
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
    this.atBottom  = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.offsetHeight <= 0;
  }

  scrollToBottom(duration = 0) {
    if (this.content) {
      this.content.scrollToBottom(duration);
    }
  }

  async sendMessage() {
    const msg = this.message; // save the message so can reload it if it fails to send
    this.message = ''; // clear message straight away to keep app responsive
    try {
      await this.chatService.addChatMessage(this.chatId, msg);
    } catch (err) {
      console.log('failed to send chat message', err);
      this.message = msg;
    }
  }

  linkSomething() {
    console.log(`link something`);
  }
}
