import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IonContent } from '@ionic/angular';
import { map, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chat;
  message: string;
  messages: Observable<any>;
  currentUserId = this.auth.currentUser.value.id;

  @ViewChild(IonContent) content: IonContent;
  @ViewChild('input', { read: ElementRef }) inputContainer: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.route.params.subscribe(routeData => {
      this.chatService.getOneChat(routeData.id).subscribe(chatData => {
        this.chat = chatData;
        this.messages = this.chatService.getChatMessages(this.chat.id).pipe(
          map((messages: any) => {
            for (const msg of messages) {
              msg.user = this.getChatUser(msg.from);
            }
            return messages;
          }),
          tap(() => {
            setTimeout(() => {
              this.scrollToBottom(0);
            }, 500);
          })
          );
        });
    });
  }

  getChatUser(userId) {
    for (const usr of this.chat.users) {
      if (usr.id === userId) {
        return usr.nickname;
      }
    }
    return 'Deleted';
  }


  scrollToBottom(duration = 250) {
    this.content.scrollToBottom(duration);
  }

  async sendMessage() {
    const msg = this.message; // save the message so can reload it if it fails to send
    this.message = ''; // clear message straight away to keep app responsive

    try {
      await this.chatService.addChatMessage(msg, this.chat.id);
      this.scrollToBottom();
    } catch (err) {
      console.log('oh no!', err);
      this.message = msg;
    }
  }

  leaveChat() {
    const newUsers = this.chat.users.filter(usr => usr.id !== this.currentUserId);

    this.chatService.leaveChat(this.chat.id, newUsers).subscribe(res => {
      this.router.navigateByUrl('/menu/chats');
    });
  }
}
