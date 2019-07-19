import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  tickets;

  constructor(private router: Router, private ticketService: TicketService) { }

  ngOnInit() {
    this.ticketService.getUserTickets().subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  addTicket() {
    this.router.navigateByUrl('menu/ticket');
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tickets, event.previousIndex, event.currentIndex);
  }

}
