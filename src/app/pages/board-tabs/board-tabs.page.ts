import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardService } from 'src/app/services/board.service';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage {

  public allBoards$: Observable<any> = this.boardService.allBoardsSubject;
  public currentBoard;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'Edit Board',
      icon: 'create',
      func: this.editBoard,
    },
    {
      title: 'New Board',
      icon: 'add',
      func: this.newBoard,
    },
  ];

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

  editBoard() {
    console.log('you want to edit a board ey?');
  }

  newBoard() {
    console.log('you want to make a new board');
  }
}
