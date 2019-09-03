import { Component, OnInit } from '@angular/core';
import { GroupService } from 'src/app/services/group.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.page.html',
  styleUrls: ['./list-groups.page.scss'],
})
export class ListGroupsPage implements OnInit {

  groups$;
  nextThemeIcon;

  constructor(
    private groupService: GroupService,
    private themeService: ThemeService,
    ) { }

  ngOnInit() {
    this.groups$ = this.groupService.getUsersGroups();
    this.setThemeIcon();
  }

  setThemeIcon() {
    this.themeService.getNextTheme().then(t => this.nextThemeIcon = t.icon );
  }

  switchTheme(): void {
    this.themeService.setNextTheme().then( _ => this.setThemeIcon() );
  }



}
