import { Component } from '@angular/core';
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
  public groups$: Observable<any> = this.groupService.allGroupsSubject;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'New Group',
      icon: 'add',
      func: () => this.startGroup(),
    }
  ];
  private closeAllSlidingItems = () => {};

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

    const onClosed = () => {
      if (typeof startGroupModal.dismiss === 'function') {
        startGroupModal.dismiss();
      }
    };

    const onSaved = async (title, contacts) => {
      const newGroup = await this.groupService.createGroup(title, contacts);
      await this.router.navigateByUrl(`/group/${newGroup.id}`);
      onClosed();
    };

    startGroupModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        onSaved,
        onClosed,
        header: 'New group',
        ctaText: 'Start',
        allContacts: true,
      }
    });

    await startGroupModal.present();
  }

  onGroupItemClick = (group) => {
    this.router.navigateByUrl(`/group/${group.id}`);
  }

  editGroup = async (group) => {
    let editGroupModal: HTMLIonModalElement;

    const onClosed = () => {
      if (typeof editGroupModal.dismiss === 'function') {
        editGroupModal.dismiss();
      }
    };

    const onSaved = (title, contacts) => {
      onClosed();
      this.groupService.editGroup(group.id, title, contacts);
    };

    editGroupModal = await this.modalController.create({
      component: StartInstanceComponent,
      componentProps: {
        onSaved,
        onClosed,
        header: 'Edit group',
        selectedContacts: group.members,
        title: group.title,
        ctaText: 'Save Changes',
        allContacts: true,
      }
    });
    await editGroupModal.present();
    this.closeAllSlidingItems();
  }

  deleteGroup = async (group) => {
    let alert;
    if (group.members.length > 1) {
      alert = await this.alertCtrl.create({
        message: `There are other members in this group.
        By deleting it you will leave it and it will not show in your account,
        but it will still exist for the other members.
        <br><br>
        Are you sure you want to delete:
        <br><br>
        <b>${group.title}</b>
        <br><br>`,
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
                  Are you sure you want to delete:
                  <br><br>
                  <b>${group.title}</b>
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
    this.closeAllSlidingItems();
  }

  slidingListChanged(details) {
    this.settingsOptions = [
      {
        title: 'New Group',
        icon: 'add',
        func: () => this.startGroup(),
      }
    ];
    if (details.items) {
      this.settingsOptions.push({
          title: 'Edit Groups',
          icon: 'create',
          func: details.openAll,
        });
    }
    this.closeAllSlidingItems = details.closeAll;
  }
}
