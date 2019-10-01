import { Component, OnInit } from '@angular/core';
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
export class MenuPage implements OnInit {

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
  public nextTheme: any;
  public currentGroup$ = this.groupService.currentGroupSubject;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    private groupService: GroupService,
    ) {}


  ngOnInit() {
    this.getNextTheme();
  }

  getNextTheme(): void {
    this.themeService.getNextTheme().then(t => this.nextTheme = t);
  }

  switchTheme(): void {
    this.themeService.toggleThemes().then( _ => this.getNextTheme() );
  }

  showSettings() {
    console.log('show settings');
  }

  logOut() {
    this.auth.logOut();
  }
}


