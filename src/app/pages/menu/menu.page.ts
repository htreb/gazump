import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
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
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    ) {}


  ngOnInit() {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url) {
        this.selectedPath = event.url;
      }
    });

    const groupId = this.route.snapshot.paramMap.get('groupId');

    this.pages = [
      {
        title: 'All Groups',
        url: '/groups'
      },
      {
        title: 'Board',
        url: `/groups/${groupId}/board` // TODO this doesn't seem like the best way to navigate
      },
      {
        title: 'New ticket',
        url: `/groups/${groupId}/ticket`
      },
      {
        title: 'Chats',
        url: `/groups/${groupId}/chats`
      },
      {
        title: 'Profile',
        url: `/groups/${groupId}/profile`
      },
    ];
  }

  logOut() {
    this.auth.logOut();
  }
}


