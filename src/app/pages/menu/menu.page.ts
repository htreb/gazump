import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export interface Page {
  title: string;
  url: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  selectedPath = '';
  pages: Page[];

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    ) {}


  ngOnInit() {
    // TODO this doesn't seem like the best way to navigate but I want to stay
    // within this group, relative navigating gets in a mess when you nav to a
    // few pages it keeps adding to the url.
    // ../ 'up one' might work but this is more explicit.
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.pages = [
      {
        title: 'Boards',
        url: `/groups/${groupId}`
      },
      {
        title: 'Chats',
        url: `/groups/${groupId}/chats`
      },
      {
        title: 'Profile', // TODO should this be nested within the group
        url: `/groups/${groupId}/profile`
      },
      {
        title: 'Back To Groups',
        url: '/groups'
      },
    ];
  }

  logOut() {
    this.auth.logOut();
  }
}


