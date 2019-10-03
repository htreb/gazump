import { Component, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardService } from 'src/app/services/board.service';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { ModalController, AlertController } from '@ionic/angular';
import { BoardDetailComponent } from './board-detail/board-detail.component';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage {

  @ViewChildren('tabButton') tabButtons: any;
  public allBoards$: Observable<any> = this.boardService.allBoardsSubject;
  public displayingBoardId = '';

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    ) { }

  findMatchingBoard(allBoards, matchingId) {
    if (Array.isArray(allBoards)) {
      const matching = allBoards.filter(b => b.id === matchingId);
      if (matching.length === 1) {
        return matching[0];
      }
    }
    return {};
  }

  segmentButtonSelected(boardId) {
    this.displayingBoardId = boardId;
  }

  settingsOptions(allBoards, matchingId): SettingsOption[] {
    const currentBoard = this.findMatchingBoard(allBoards, matchingId);
    let options = [
      {
        title: 'New Board',
        icon: 'add',
        func: () => this.openBoardDetail(),
      },
    ];
    if (currentBoard.title) {
      options = options.concat([
        {
          title: `Edit "${currentBoard.title}"`,
          icon: 'create',
          func: () => this.openBoardDetail(currentBoard),
        },
        {
          title: `Delete "${currentBoard.title}"`,
          icon: 'trash',
          func: () => this.deleteBoard(currentBoard),
        }
      ]);
    }

    return options;
  }

  async deleteBoard(board, callBack?) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to delete the board and all its tickets:
                <br><br>
                <b>${board.title}</b>
                <br><br>
                This cannot be undone.`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.boardService.deleteBoard(board.id).then(() => {
              this.displayingBoardId = '';
              if (this.tabButtons.first) {
                // need to select another tab here!
                this.tabButtons.first.el.click();
              }
              if (typeof callBack === 'function') {
                callBack();
              }
            });
          }
        }
      ]
    });
    await alert.present();
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
        deleteBoard: board ? () => this.deleteBoard(board, closeBoardDetail) : null,
      }
    });

    function closeBoardDetail(args) {
      return modal.dismiss(args);
    }

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      if (board && board.id) {
        this.boardService.updateBoard(board.id, data);
      } else {
        this.boardService.createBoard(data).then(resp => {
          // find the matching tab and select it
          this.tabButtons.forEach(tab => {
            if (tab.value === resp.id) {
              tab.el.click();
            }
          });
        });
      }
    }
  }

}
