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
  public groupId: string;

  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardsForGroup$ = this.ticketService.getBoardsForGroup(this.groupId);
  }

  boardChanged(ev) {
    this.currentBoard = ev.detail.value;
  }
}
