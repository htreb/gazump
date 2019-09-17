import { Component } from '@angular/core';
import { ChatService } from 'src/app/chat.service';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ChatComponent } from 'src/app/shared/chat/chat.component';

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

  startChat() {
    console.log('you want to start a chat');
  }

  async showChat(chatId: string) {
    const modal = await this.modalController.create({
      component: ChatComponent,
      componentProps: {
        chatId,
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
}
