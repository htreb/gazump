import { Component, ViewChildren, ViewChild } from '@angular/core';
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

  private slidingItemsOpen = {};
  private openedAllSlidingItemsFromMenu = false;

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

  async editGroup(group) {
    let editGroupModal: HTMLIonModalElement;

    const onClosed = () => {
      if (typeof editGroupModal.dismiss === 'function') {
        editGroupModal.dismiss();
      }
    };

    const onSaved = async (title, contacts) => {
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

  async deleteGroup(group) {
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

  openSlidingOptions() {
    // if one is open for some reason this closes it.
    // make sure they are all closed before opening them all.
    this.closeAllSlidingItems();
    this.groupItems.forEach((item) => {
      item.open();
    });
    this.openedAllSlidingItemsFromMenu = true;
  }

  groupItemDragged(ratio, id) {
    this.slidingItemsOpen[id] = ratio === 1;
  }

  async onGroupItemClick(group) {
    if (Object.values(this.slidingItemsOpen).filter(v => v).length) {
      this.closeAllSlidingItems();
    } else {
      this.router.navigateByUrl(`/group/${group.id}`);
    }
  }

  closeAllSlidingItems() {
    this.groupItems.forEach((item) => {
      item.close();
    });
    this.slidingItemsOpen = {};
    this.openedAllSlidingItemsFromMenu = false;
  }

  slidingItemClicked() {
    if (this.openedAllSlidingItemsFromMenu) {
      this.closeAllSlidingItems();
    }
  }
}
