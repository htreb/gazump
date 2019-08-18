import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent implements OnInit {

  @Input() ticketDetails: any;

  constructor() { }

  ngOnInit() {}

}
