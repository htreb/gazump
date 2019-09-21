import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ChatComponent } from 'src/app/shared/chat/chat.component';
import { StartChatComponent } from 'src/app/shared/start-chat/start-chat.component';

@Component({
  selector: 'app-list-chats',
  templateUrl: './list-chats.page.html',
  styleUrls: ['./list-chats.page.scss'],
})
export class ListChatsPage {

  public chats$: Observable<any> = this.chatService.allChatsSubject;

  constructor(
    private chatService: ChatService,
    private modalController: ModalController,
    ) { }

  async showChat(chatId: string) {
    const chatModal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {
        chatId,
      }
    });
    await chatModal.present();
    const { data } = await chatModal.onWillDismiss();
  }

  async startChat() {
    const startChatModal = await this.modalController.create({
      component: StartChatComponent,
      componentProps: {}
    });
    await startChatModal.present();
    const { data } = await startChatModal.onWillDismiss();
    console.log('startChat data', data);
  }
}
