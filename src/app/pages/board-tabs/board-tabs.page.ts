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
    private alertCtrl: AlertController,
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

    const boardRightNow = JSON.parse(JSON.stringify(this.currentBoard));
    if (boardRightNow) {
      this.settingsOptions = this.settingsOptions.concat([
        {
          title: `Edit "${boardRightNow.title}"`,
          icon: 'create',
          func: () => this.openBoardDetail(boardRightNow),
        },
        {
          title: `Delete "${boardRightNow.title}"`,
          icon: 'trash',
          func: () => this.deleteBoard(boardRightNow),
        }
      ]);
    }
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
              this.currentBoard = null;
              if (this.tabButtons.first) {
                // need to select another tab here!
                this.tabButtons.first.el.click();
              }
              this.updateSettingsOptions();
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
        // If editing the current board then update it here
        // it won't auto do it until a tab is changed
        this.currentBoard = { ...this.currentBoard, ...data };
        this.updateSettingsOptions();
      } else {
        this.boardService.createBoard(data).then(resp => {
          // find the matching tab and select it
          this.tabButtons.forEach(tab => {
            if (tab.value.id === resp.id) {
              tab.el.click();
            }
          });
        });
      }
    }
  }

}
