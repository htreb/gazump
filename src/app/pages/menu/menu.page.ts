import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
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
  pages: Page[] = [
    {
      title: 'Board',
      url: '/menu/board'
    },
    {
      title: 'Chat',
      url: '/menu/chat'
    },
    {
      title: 'New ticket',
      url: '/menu/ticket'
    },
  ];

  constructor(private router: Router, private auth: AuthService) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url) {
        this.selectedPath = event.url;
      }
    });
  }

  ngOnInit() {

  }

  logOut() {
    this.auth.logOut();
  }
}


