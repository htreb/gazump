import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage implements OnInit {

  public boardsForGroup$: Observable<any>;
  public currentBoard: string;

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute, ) { }

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardsForGroup$ = this.ticketService.getBoardsForGroup(groupId);
  }

  boardChanged(ev) {
    this.currentBoard = ev.detail.value;
  }
}
