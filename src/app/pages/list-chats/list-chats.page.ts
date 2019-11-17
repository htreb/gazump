import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Observable } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
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
      title: 'New Chat',
      icon: 'add',
      func: () => this.startChat(),
    }
  ];
  private closeAllSlidingItems = () => {};

  constructor(
    private chatService: ChatService,
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
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
        ctaText: 'Start',
      }
    });

    return await startChatModal.present();
  }

  onChatItemClick = (chat) => {
    this.router.navigate([chat.id], { relativeTo: this.route });
  }

  editChat = async (chat) => {
    let editChatModal: HTMLIonModalElement;

    const onClosed = () => {
      if (typeof editChatModal.dismiss === 'function') {
        editChatModal.dismiss();
      }
    };

    const onSaved = (title, contacts) => {
      onClosed();
      this.chatService.editChat(chat.id, title, contacts);
    };

    editChatModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        onSaved,
        onClosed,
        header: 'Edit Chat',
        selectedContacts: chat.members,
        title: chat.title,
        ctaText: 'Save Changes',
      }
    });
    await editChatModal.present();
    this.closeAllSlidingItems();
  }

  deleteChat = async (chat) => {
    let alert;
    if (chat.members.length > 1) {
      alert = await this.alertCtrl.create({
        message: `There are other members in this chat.
        By deleting it you will leave it and it will not show in your account,
        but it will still exist for the other members.
        <br><br>
        Are you sure you want to delete:
        <br><br>
        <b>${chat.title}</b>
        <br><br>`,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.chatService.leaveChat(chat.id);
            }
          }
        ]
      });
    } else {
      alert = await this.alertCtrl.create({
        message: `You are the last member of this chat. If you leave, the chat and all its messages will be permanently deleted.
                  <br><br>
                  Are you sure you want to delete:
                  <br><br>
                  <b>${chat.title}</b>
                  <br><br>
                  This cannot be undone.`,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.chatService.deleteChat(chat.id);
            }
          }
        ]
      });
    }

    await alert.present();
    this.closeAllSlidingItems();
  }

  slidingListChanged(details) {
    this.settingsOptions = [
      {
        title: 'New Chat',
        icon: 'add',
        func: () => this.startChat(),
      }
    ];
    if (details.items) {
      this.settingsOptions.push({
          title: 'Edit Chats',
          icon: 'create',
          func: details.openAll,
        });
    }
    this.closeAllSlidingItems = details.closeAll;
  }

}
