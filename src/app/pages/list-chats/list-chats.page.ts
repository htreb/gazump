import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ChatComponent } from 'src/app/shared/chat/chat.component';
import { StartInstanceComponent } from 'src/app/shared/start-instance/start-instance.component';
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
      icon: 'add',
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
        chatId,
        closeChat,
      }
    });
    function closeChat() {
      chatModal.dismiss();
    }
    return await chatModal.present();
  }

  async startChat() {
    let startChatModal: HTMLIonModalElement;

    const closeInstance = () => {
      if (typeof startChatModal.dismiss === 'function') {
        startChatModal.dismiss();
      }
    };

    const startInstance = async (title, contacts) => {
      const newChat = await this.chatService.startChat(title,  contacts);
      await this.showChat(newChat.id);
      closeInstance();
    };

    startChatModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        startInstance,
        closeInstance,
        instanceName: 'Chat',
      }
    });

    return await startChatModal.present();
  }
}
