import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss']
})
export class CreateGroupPage implements OnInit {
  public title = '';
  public participant = '';
  public users = [];
  private toast;

  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    private chatService: ChatService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {}

  addUser() {
    if (this.participant === this.auth.currentUser.value.email ||
        this.participant === this.auth.currentUser.value.userName) {
          this.showWarnToast('You can\'t add yourself');
          this.participant = '';
          return;
        }

    if (
      this.users.filter(
        usr =>
          usr.email === this.participant || usr.userName === this.participant
      ).length
    ) {
      // we already have them in the list don't add them again.
      this.showWarnToast('That user is already added');
      this.participant = '';
      return;
    }

    this.chatService
      .findUserByEmailOrUserName(this.participant)
      .subscribe((res: any) => {
        let foundUser = false;
        for (const data of res) {
          if (data.length) {
            foundUser = true;
            this.users.push({
              email: data[0].email,
              id: data[0].id,
              userName: data[0].userName
            });
            console.log('no problem, I can add:', data[0]);
          }
        }
        if (!foundUser) {
          this.showWarnToast('Couldn\'t find that user');
        } else {
          this.participant = '';
        }
      });

  }

  /**
   * Show toast about error adding group user
   * @param message string to show
   */
  async showWarnToast(message: string) {
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

  createGroup() {
    if (!this.users.length) {
      this.showWarnToast('You must add some users before starting a group');
      return;
    }
    // TODO show some loading indicator while this is loading...
    this.groupService.createGroup(this.title, this.users).then(group => {
      this.router.navigate(['groups']);
    });
  }
}
