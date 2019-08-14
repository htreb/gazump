import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss']
})
export class CreateGroupPage implements OnInit {
  public title = '';
  public memberToAdd = '';
  public currentMembers = [];
  private toast;

  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    private router: Router,
    private toastCtrl: ToastController,
    private profileService: ProfileService
  ) {}

  ngOnInit() {}

  addMember() {
    if (this.memberToAdd === this.auth.currentUser.value.email) {
      this.showWarnToast('You don\'t need to add yourself!');
      this.memberToAdd = '';
      return;
    }
    if (this.currentMembers.filter(usr => usr.email === this.memberToAdd).length) {
      this.showWarnToast('That user is already added');
      this.memberToAdd = '';
      return;
    }

    this.profileService
      .getProfileFromEmail(this.memberToAdd)
      .subscribe(profiles => {
        if (profiles.length) {
          this.currentMembers.push({
            email: profiles[0].email,
            id: profiles[0].id,
            name: profiles[0].name
          });
          this.memberToAdd = '';
        } else {
          this.showWarnToast('Couldn\'t find that user');
        }
      });
  }

  /**
   * Show toast with passed in string
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
    if (!this.currentMembers.length) {
      this.showWarnToast('You must add some users before starting a group');
      return;
    }
    if (!this.title) {
      this.showWarnToast('Please choose a group title');
      return;
    }
    const memberIds = this.currentMembers.map(member => member.id);
    this.groupService.createGroup(this.title, memberIds).catch(err => {
      console.log('failed to created group with error', err);
    });
    this.router.navigate(['groups']);
  }
}
