import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  addTicket() {
    this.router.navigateByUrl('menu/ticket');
  }
}
