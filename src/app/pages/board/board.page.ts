import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  tickets: Observable<any>;

  constructor(private router: Router, private ticketService: TicketService) { }

  ngOnInit() {
    this.tickets = this.ticketService.getUserTickets();
  }

  addTicket() {
    this.router.navigateByUrl('menu/ticket');
  }
}
