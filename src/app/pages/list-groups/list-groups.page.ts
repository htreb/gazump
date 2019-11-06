import { Component, ViewChildren } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Observable } from 'rxjs';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { StartInstanceComponent } from 'src/app/shared/start-instance/start-instance.component';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.page.html',
  styleUrls: ['./list-groups.page.scss'],
})
export class ListGroupsPage {
  @ViewChildren('groupItem') groupItems: any;

  public groups$: Observable<any> = this.groupService.allGroupsSubject;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'New Group',
      icon: 'add',
      func: () => this.startGroup(),
    },
    {
      title: 'Edit Groups',
      icon: 'create',
      func: () => this.openSlidingOptions(),
    }
  ];

  constructor(
    private groupService: GroupService,
    private router: Router,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    ) { }

  ionViewWillEnter() {
    this.groupService.showGroupMenuItems = false;
  }

  ionViewWillLeave() {
    this.groupService.showGroupMenuItems = true;
  }

  async startGroup() {
    let startGroupModal: HTMLIonModalElement;

    const closeInstance = () => {
      if (typeof startGroupModal.dismiss === 'function') {
        startGroupModal.dismiss();
      }
    };

    const startInstance = async (title, contacts) => {
      const newGroup = await this.groupService.createGroup(title, contacts);
      await this.router.navigateByUrl(`/group/${newGroup.id}`);
      closeInstance();
    };

    startGroupModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        startInstance,
        closeInstance,
        instanceName: 'Group',
        allContacts: true,
      }
    });

    return await startGroupModal.present();
  }

  editGroup(group) {
    console.log('editGroup', group);
  }

  async deleteGroup(group) {
    let alert;
    if (group.members.length > 1) {
      alert = await this.alertCtrl.create({
        message: `There are other members in this group.
        By deleting it you will leave it and it will not show in your account,
        but it will still exist for the other members.`,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.groupService.leaveGroup(group.id);
            }
          }
        ]
      });
    } else {
      alert = await this.alertCtrl.create({
        message: `You are the last member of this group. If you leave, the group and all its tickets will be permanently deleted.
                  <br><br>
                  This cannot be undone.`,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.groupService.deleteGroup(group.id);
            }
          }
        ]
      });
    }

    await alert.present();
  }

  openSlidingOptions() {
    this.groupItems.forEach((item) => {
      item.open();
    });
  }

}
