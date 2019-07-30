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

  @ViewChild(IonContent, { static: true }) content: IonContent;
  @ViewChild('input', { read: ElementRef, static: true }) inputContainer: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.route.params.subscribe(routeData => {
      this.chatService.getOneChat(routeData.id).subscribe((chatData) => {

        if (!chatData) {
          // Chat doesn't exit
          this.router.navigateByUrl('/menu/chats');
          return;
        }

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
        return usr.userName;
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



  getPicture(options) {
    return new Promise((resolve, reject) => {
      resolve('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');
    });
  }


  sendFile() {
    // const options: CameraOptions = {
    //   // quality: 70,
    //   // destinationType: this.camera.DestinationType.DATA_URL,
    //   // encodingType: this.camera.EncodingType.JPEG,
    //   // mediaType: this.camera.MediaType.PICTURE,
    //   // sourceType: this.camera.PictureSourceType.CAMERA,
    //   // correctOrientation: true
    // };

    this.getPicture({}).then(pic => {
      const obj = this.chatService.saveFileToStorage(pic, this.chat.id);
      const task = obj.task;

      task.then(res => {
        obj.ref.getDownloadURL().subscribe(url => {
          this.chatService.saveFileMessage(url, this.chat.id);
        });
      });

      task.percentageChanges().subscribe(percent => {
        console.log(`uploading ${percent}%...`);
      });
    });
  }
}
