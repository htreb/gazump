import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ChatComponent } from 'src/app/shared/chat/chat.component';
import { StartChatComponent } from 'src/app/shared/start-chat/start-chat.component';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';

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
      icon: 'create',
      func: () => this.startChat(),
    }
  ];

  constructor(
    private chatService: ChatService,
    private modalController: ModalController
  ) {}

  async showChat(chatId: string) {
    const chatModal = await this.modalController.create({
      component: ChatComponent,
      cssClass: 'full-screen',
      componentProps: {
        chatId
      }
    });
    return await chatModal.present();
  }

  async startChat() {
    const startChatModal = await this.modalController.create({
      component: StartChatComponent,
      componentProps: {
        closeStartChat,
        showNewChat: id => this.showChat(id)
      }
    });

    function closeStartChat() {
      startChatModal.dismiss();
    }

    return await startChatModal.present();
  }
}
