import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Observable } from 'rxjs';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { StartInstanceComponent } from 'src/app/shared/start-instance/start-instance.component';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.page.html',
  styleUrls: ['./list-groups.page.scss'],
})
export class ListGroupsPage implements OnInit {

  public groups$: Observable<any> = this.groupService.allGroupsSubject;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'New Group',
      icon: 'add',
      func: () => this.startGroup(),
    }
  ];

  constructor(
    private groupService: GroupService,
    private router: Router,
    private modalController: ModalController,
    ) { }

  ngOnInit() {
    this.groupService.subscribeToUsersGroups();
  }

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
}
