import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardService } from 'src/app/services/board.service';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { ModalController } from '@ionic/angular';
import { BoardDetailComponent } from './board-detail/board-detail.component';

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
      func: () => this.openBoardDetail(),
    },
  ];

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
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
        func: () => this.openBoardDetail(),
      },
    ];

    if (this.currentBoard) {
      this.settingsOptions.unshift({
        title: `Edit ${this.currentBoard.title}`,
        icon: 'create',
        func: () => this.openBoardDetail(this.currentBoard),
      });
    }
  }


  boardTrackBy(index, board) {
    return board.id;
  }

  async openBoardDetail(board?: any) {
    const modal = await this.modalController.create({
      component: BoardDetailComponent,
      componentProps: {
        board,
        closeBoardDetail,
      }
    });

    function closeBoardDetail() {
      modal.dismiss();
    }

    await modal.present();
    const { data } = await modal.onWillDismiss();
  }

}
