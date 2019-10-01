import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Observable } from 'rxjs';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';

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
      func: () => this.createGroup(),
    }
  ];

  constructor(
    private groupService: GroupService,
    ) { }

  ngOnInit() {
    this.groupService.subscribeToUsersGroups();
  }

  ionViewDidEnter() {
    this.groupService.showGroupMenuItems = false;
  }

  ionViewWillLeave() {
    this.groupService.showGroupMenuItems = true;
  }

  createGroup() {
    console.log('start a group here');
  }
}
