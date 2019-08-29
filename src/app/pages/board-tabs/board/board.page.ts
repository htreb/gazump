import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  board$;
  private boardId: string;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService) { }

  ngOnInit() {
    // I shouldn't need to save this if it's coming down with the board
    this.boardId = this.route.snapshot.paramMap.get('boardId');

    console.log(`${this.boardId} init`);
    this.board$ = this.boardService.boardsFromCurrentGroup(this.boardId);
    console.log('the board is now', this.board$);
  }




  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardId);
  }
}
