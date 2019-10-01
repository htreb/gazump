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
      title: 'New Board',
      icon: 'add',
      func: this.newBoard,
    },
  ];

  constructor(
    private boardService: BoardService,
    ) { }

  segmentButtonSelected(board) {
    this.currentBoard = board;
    this.updateSettingsOptions();
  }

  updateSettingsOptions() {
    this.settingsOptions = [
      {
        title: 'New Board',
        icon: 'add',
        func: this.newBoard,
      },
    ];

    if (this.currentBoard) {
      this.settingsOptions.unshift({
        title: `Edit ${this.currentBoard.title}`,
        icon: 'create',
        func: () => this.editBoard(this.currentBoard),
      });
    }
  }


  boardTrackBy(index, board) {
    return board.id;
  }

  editBoard(board) {
    console.log('you want to edit a board ey?', board);
  }

  newBoard() {
    console.log('you want to make a new board');
  }
}
