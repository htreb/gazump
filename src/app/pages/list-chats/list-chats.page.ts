import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { StartInstanceComponent } from 'src/app/shared/start-instance/start-instance.component';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-chats',
  templateUrl: './list-chats.page.html',
  styleUrls: ['./list-chats.page.scss']
})
export class ListChatsPage {
  public chats$: Observable<any> = this.chatService.allChatsUnderCurrentGroup();
  public settingsOptions: SettingsOption[] = [
    {
      title: 'Start Chat',
      icon: 'add',
      func: () => this.startChat(),
    }
  ];

  constructor(
    private chatService: ChatService,
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async startChat() {
    let startChatModal: HTMLIonModalElement;

    const onClosed = () => {
      if (typeof startChatModal.dismiss === 'function') {
        startChatModal.dismiss();
      }
    };

    const onSaved = async (title, contacts) => {
      const newChat = await this.chatService.startChat(title, contacts);
      await this.router.navigate([newChat.id], { relativeTo: this.route });
      onClosed();
    };

    startChatModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        onSaved,
        onClosed,
        header: 'New chat',
      }
    });

    return await startChatModal.present();
  }
}
