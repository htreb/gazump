import {
  Component,
  ViewChildren,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from 'src/app/services/board.service';
import { SettingsOption } from 'src/app/shared/settings-list/settings-list.component';
import { ModalController, AlertController } from '@ionic/angular';
import { BoardDetailComponent } from './board-detail/board-detail.component';
import { SettingsIconComponent } from 'src/app/shared/settings-icon/settings-icon.component';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss']
})
export class BoardTabsPage implements OnInit, OnDestroy {
  @ViewChildren('tabButton') tabButtons: any;
  @ViewChild(SettingsIconComponent, { static: false }) settings;
  public allBoards: any;
  public displayingBoardId: string;
  public settingsOptions: SettingsOption[] = [
    {
      title: 'New Board',
      icon: 'add',
      func: this.openBoardDetail
    }
  ];
  public displayingBoardTitle: string;
  public scrollToTicketDetails: any;

  private allBoardsSub: Subscription;

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.allBoardsSub = this.boardService.allBoardsSubject.subscribe(
      allBoards => {
        this.allBoards = allBoards;
        this.updateSettingsAndTitle();
      }
    );

    this.router.queryParams.subscribe( params => {
      if (params.ticket) {
        this.scrollToTicket(params.ticket);
      }
    });
  }

  ngOnDestroy(): void {
    this.allBoardsSub.unsubscribe();
  }

  segmentButtonSelected(boardId) {
    this.displayingBoardId = boardId;
    this.updateSettingsAndTitle();
  }

  updateSettingsAndTitle() {
    this.settingsOptions = [
      {
        title: 'New Board',
        icon: 'add',
        func: () => this.openBoardDetail()
      }
    ];
    this.displayingBoardTitle = '';
    let currentBoard =
      this.displayingBoardId &&
      !this.allBoards.loading &&
      this.allBoards.filter(b => this.displayingBoardId === b.id)[0];
    if (!currentBoard && this.allBoards[0]) {
      currentBoard = this.allBoards[0];
      this.displayingBoardId = currentBoard.id;
      if (this.settings) {
        this.settings.closeSettings();
      }
    }
    if (currentBoard) {
      this.displayingBoardTitle = currentBoard.title;
      this.settingsOptions = this.settingsOptions.concat([
        {
          title: `Edit "${currentBoard.title}"`,
          icon: 'create',
          func: () => this.openBoardDetail(this.displayingBoardId)
        },
        {
          title: `Delete "${currentBoard.title}"`,
          icon: 'trash',
          func: () => this.deleteBoard(this.displayingBoardId)
        },
        // TODO delete this!
        {
          title: `Dummy tickets for "${currentBoard.title}"`,
          icon: 'construct',
          func: () => this.boardService.makeDummyTickets(this.displayingBoardId)
        }
      ]);
    }
  }

  async deleteBoard(boardId: string, callBack?) {
    const board = this.boardService.getOneBoard(boardId);
    const alert = await this.alertCtrl.create({
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

  async openBoardDetail(boardId?: string) {
    const board = boardId ? this.boardService.getOneBoard(boardId) : null;
    const modal = await this.modalController.create({
      component: BoardDetailComponent,
      componentProps: {
        board,
        closeBoardDetail,
        deleteBoard: board
          ? () => this.deleteBoard(board.id, closeBoardDetail)
          : null
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
          this.displayingBoardId = resp.id;
          // find the matching tab and scrolls it into view
          this.tabButtons.forEach(tab => {
            if (tab.value === resp.id) {
              tab.el.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }
    }
  }

  scrollToTicket(ticketId) {
    // subscribe to the allBoardsSubject. Only try to scroll to a ticket once the boards have loaded
    this.boardService.allBoardsSubject
      .pipe(
        takeWhile(boards => boards.loading)
      ).subscribe(boards => {
        // allBoards loading now
      }, err => {
        // error in allBoards subscription
      }, () => {
        // subscription complete. allBoards have loaded now
        const ticketDetails = this.boardService.findTicketPositionDetails(ticketId);
        this.displayingBoardId = ticketDetails.currentBoardId;
        this.scrollToTicketDetails = {
          ticketId,
          ...ticketDetails
        };
        this.updateSettingsAndTitle();
      });
  }
}
