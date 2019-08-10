import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.page.html',
  styleUrls: ['./list-groups.page.scss'],
})
export class ListGroupsPage implements OnInit {

  groups$;

  constructor(private groupService: GroupService) { }

  ngOnInit() {
    this.groups$ = this.groupService.getGroups();
  }

}
