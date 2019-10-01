import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.page.html',
  styleUrls: ['./list-groups.page.scss'],
})
export class ListGroupsPage implements OnInit {

  public groups$: Observable<any> = this.groupService.allGroupsSubject;

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
}
