import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TicketService } from 'src/app/services/ticket.service';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.page.html',
  styleUrls: ['./start-chat.page.scss']
})
export class StartChatPage implements OnInit {
  public title = '';
  public participant = '';
  public users = [];
  private toast;

  constructor(
    private auth: AuthService,
    private chatService: ChatService,
    private router: Router,
    private ticketService: TicketService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {}

  addUser() {
    if (this.participant === this.auth.currentUser.value.email ||
        this.participant === this.auth.currentUser.value.nickname) {
          this.warnBadChatUser('You can\'t add yourself');
          this.participant = '';
          return;
        }

    if (
      this.users.filter(
        usr =>
          usr.email === this.participant || usr.nickname === this.participant
      ).length
    ) {
      // we already have them in the list don't add them again.
      this.warnBadChatUser('That user is already added');
      this.participant = '';
      return;
    }

    this.chatService
      .findUserByEmailOrNickName(this.participant)
      .subscribe((res: any) => {
        let foundUser = false;
        for (const data of res) {
          if (data.length) {
            foundUser = true;
            this.users.push({
              email: data[0].email,
              id: data[0].id,
              nickname: data[0].nickname
            });
            console.log('no problem, I can add:', data[0]);
          }
        }
        if (!foundUser) {
          this.warnBadChatUser('Couldn\'t find that user');
        } else {
          this.participant = '';
        }
      });

  }

  /**
   * Show toast about error adding chat user
   * @param message string to show
   */
  async warnBadChatUser(message: string) {
    if (this.toast) {
      this.toast.dismiss();
    }
    this.toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'warning'
    });
    this.toast.present();
  }

  startChat() {
    if (!this.users.length) {
      this.warnBadChatUser('You must add some users before starting a chat');
      return;
    }
    this.chatService.createChat(this.title, this.users);
  }
}
