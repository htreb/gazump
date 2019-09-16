import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage {

  public currentBoard;
  public allBoards$: Observable<any> = this.boardService.allBoardsSubject;

  constructor(
    private boardService: BoardService,
    ) { }

  setCurrentBoard(allBoards) {
    this.currentBoard = allBoards[0];
    return false;
  }

  segmentChanged(ev) {
    this.currentBoard = ev.detail.value;
  }

  boardTrackBy(index, board) {
    return board.id;
  }
}
