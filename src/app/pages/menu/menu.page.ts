import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { GroupService } from 'src/app/services/group.service';

export interface Page {
  title: string;
  icon: string;
  url: string;
  routerDirection: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {

  public pages: Page[] = [
    {
      title: 'Boards',
      url: 'boards',
      icon: 'albums',
      routerDirection: 'forward',
    },
    {
      title: 'Chats',
      url: 'chats',
      icon: 'chatboxes',
      routerDirection: 'forward',
    }
  ];

  public currentGroup$ = this.groupService.currentGroupSubject;

  constructor(
    private auth: AuthService,
    public themeService: ThemeService,
    public groupService: GroupService,
    ) {}

  logOut() {
    this.auth.logOut();
  }
}


