import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ChatService } from 'src/app/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {

  @ViewChild(IonContent, { static: true }) content: IonContent;
  public message = '';
  @Input() chat;

  constructor(
    private chatService: ChatService,
  ) { }

  ngOnInit() {
    this.scrollToBottom();
  }

  scrollToBottom(duration = 0) {
    this.content.scrollToBottom(duration);
  }

  async sendMessage() {
    console.log(`send message`, this.message);
    const msg = this.message; // save the message so can reload it if it fails to send
    this.message = ''; // clear message straight away to keep app responsive

    try {
      // await this.chatService.addChatMessage(this.chat.id, msg);
      this.scrollToBottom();
    } catch (err) {
      console.log('failed to send chat message', err);
      this.message = msg;
    }
  }

  linkSomething() {
    console.log(`link something`);
  }




}
