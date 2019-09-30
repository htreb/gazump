import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

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

  selectedPath = '';
  pages: Page[];
  public nextTheme: any;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    ) {}


  ngOnInit() {
    this.getNextTheme();

    // TODO this doesn't seem like the best way to navigate but I want to stay
    // within this group, relative navigating gets in a mess when you nav to a
    // few pages it keeps adding to the url.
    // ../ 'up one' might work but this is more explicit.
    const groupId = this.route.snapshot.paramMap.get('groupId');


    this.pages = [
      {
        title: 'Boards',
        url: `/groups/${groupId}`,
        icon: 'albums',
        routerDirection: 'forward',
      },
      {
        title: 'Chats',
        url: `/groups/${groupId}/chats`,
        icon: 'chatboxes',
        routerDirection: 'forward',
      }
    ];
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


