import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit {
  board$;
  private boardId: string;
  private newTicketSequence = {};

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    // I shouldn't need to save this if it's coming down with the board
    this.boardId = this.route.snapshot.paramMap.get('boardId');
    this.board$ = this.boardService.boardsFromCurrentGroup(this.boardId);
  }

  onTicketDrop(column, tickets, dropResult) {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      const newTickets = this.applyDrag(tickets, dropResult);
      this.newTicketSequence[`tickets.${column.state}`] = newTickets;
      this.updateDbTickets();
    }
  }

  getTicketPayload(tickets) {
    return index => {
      return tickets[index];
    };
  }

  applyDrag(arr, dragResult) {
    const { removedIndex, addedIndex, payload } = dragResult;
    if (removedIndex === null && addedIndex === null) {
      return arr;
    }
    if (removedIndex !== null) {
      arr.splice(removedIndex, 1);
    }
    if (addedIndex !== null) {
      arr.splice(addedIndex, 0, payload);
    }
    return arr;
  }

  updateDbTickets() {
    // TODO DEBOUNCE THIS!
    return this.boardService.updateBoard(this.boardId, this.newTicketSequence).then(() => {
      console.log('updated db tickets were', this.newTicketSequence);
      this.newTicketSequence = {};
    });
  }



  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardId);
  }
}
