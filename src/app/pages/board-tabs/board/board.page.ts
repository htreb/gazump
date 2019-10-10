import { Component, Input, ViewChildren, ViewChild, Inject, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { BoardService } from '../../../services/board.service';
import {
  moveItemInArray,
  transferArrayItem,
  CdkDragDrop,
  CdkDragMove
} from '@angular/cdk/drag-drop';
import { ModalController, AlertController } from '@ionic/angular';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import * as scroll from 'scroll';
import { DOCUMENT } from '@angular/common';

const distanceFromBoardEdgeToSnapScroll = 30;
const snapScrollIntervalDuration = 600;

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  animations: [
    trigger('showing', [
      state('active', style({})),
      state('hidden', style({ display: 'none' })),
      transition('hidden => active', [animate('0s')]),
      transition('active => hidden', [animate('0s')])
    ])
  ]
})
export class BoardPage implements OnChanges {
  @Input() boardData;
  @Input() scrollToTicketDetails;
  @Input() showing;
  @ViewChild('boardElement', { static: false }) boardElement: any;
  @ViewChildren('columnElement') columnElements: any;
  @ViewChildren('ticketElement') ticketElements: any;
  private scrollingTimeout: any;
  private getNextColumnToScrollToFunc: any;
  private ticketDetailModal: HTMLIonModalElement;

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const scrollToTicketDetails = changes.scrollToTicketDetails && changes.scrollToTicketDetails.currentValue;
    if (scrollToTicketDetails &&
      scrollToTicketDetails.currentBoardId === this.boardData.id) {
        // scroll after a timeout to give the view time to render.
        setTimeout(() => {
          this.scrollToTicket(scrollToTicketDetails.ticketId);
        }, 600);
    }
  }

  /**
   *  This is called from the ticket detail component as well so
   *  making it a function expression to stop the 'this' from changing
   */
  deleteTicket = async ticket => {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to delete this ticket:
                <br><br>
                <b>${ticket.title}</b>
                <br><br>
                This cannot be undone.`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.boardService.deleteTicketSnippet(ticket);
            if (this.ticketDetailModal) {
              this.ticketDetailModal.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getColumnIds() {
    const ids = [];
    if (this.boardData.states) {
      this.boardData.states.forEach(s =>
        ids.push(`${this.boardData.id}${s.id}`)
      );
    }
    return ids;
  }

  columTrackBy(index, column) {
    return column.id;
  }

  ticketTrackBy(index, ticket) {
    return ticket.id;
  }

  get emptyTickets() {
    // the template doesn't like adding an array literal. It doesn't instantiate a new one each time
    // just keeps using the same one and the columns start duplicating each other and get in a mess.
    return [];
  }

  async updateDb(newDbValue: any) {
    try {
      await this.boardService.updateBoard(this.boardData.id, newDbValue);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message, // TODO more human readable error messages?
        buttons: ['OK']
      });
      alert.present();
    }
  }

  columnDrop(event: CdkDragDrop<any>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    this.updateDb({ states: event.container.data });
  }

  ticketDrop(event: CdkDragDrop<any>) {
    this.clearScrollTimeout();
    const updatedTickets = {};
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }
      moveItemInArray(
        event.container.data.tickets,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data.tickets,
        event.container.data.tickets,
        event.previousIndex,
        event.currentIndex
      );
      updatedTickets[`tickets.${event.previousContainer.data.stateId}`] =
        event.previousContainer.data.tickets;
    }
    updatedTickets[`tickets.${event.container.data.stateId}`] =
      event.container.data.tickets;

    this.updateDb(updatedTickets);
  }

  async openTicketDetail(currentState: any, currentTicketSnippet: any = {}) {
    this.ticketDetailModal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: {
        currentTicketSnippet,
        currentState,
        completedBy: this.boardData.completedBy,
        deleteTicket: this.deleteTicket
      }
    });
    await this.ticketDetailModal.present();

    const { data } = await this.ticketDetailModal.onWillDismiss();
    if (data && data.saveTicket) {
      if (data.ticketFormValue.id) {
        // updating a ticket which already exists
        this.boardService.updateTicketSnippet(
          currentState.id,
          data.ticketFormValue
        );
      } else {
        this.boardService.addTicketSnippet(
          this.boardData.id,
          currentState.id,
          data.ticketFormValue
        );
      }
    }
  }

  clearScrollTimeout() {
    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = false;
  }

  scrollToNextColRecursively() {
    // it's async below don't want to queue this a bunch of times before it actually gets to the timeout
    // block it now.
    this.scrollingTimeout = true;

    if (this.getNextColumnToScrollToFunc) {
      const nextCol = this.getNextColumnToScrollToFunc();
      scroll.left(
        this.boardElement.nativeElement,
        nextCol.leftToCenter,
        // { duration: snapScrollIntervalDuration }
      );

      if (nextCol.last) {
        // this shouldn't be needed but it can't hurt
        this.clearScrollTimeout();
      } else {
        this.scrollingTimeout = setTimeout(() => {
          this.scrollToNextColRecursively();
        }, snapScrollIntervalDuration);
      }
    }
  }

  onTicketDrag(event: CdkDragMove) {
    this.getNextColumnToScrollToFunc = null;
    const { left, width } = this.boardElement.nativeElement.getBoundingClientRect();

    if (
      event.pointerPosition.x < left + distanceFromBoardEdgeToSnapScroll &&
      event.delta.x < 0
    ) {
      this.getNextColumnToScrollToFunc = this.findNextColumnToLeft;
    } else if (
      event.pointerPosition.x > width + left - distanceFromBoardEdgeToSnapScroll &&
      event.delta.x > 0
    ) {
      this.getNextColumnToScrollToFunc = this.findNextColumnToRight;
    }
    if (this.getNextColumnToScrollToFunc) {
      // need to only call this one at a time!
      if (!this.scrollingTimeout) {
        return this.scrollToNextColRecursively();
      }
    } else {
      this.clearScrollTimeout();
    }
  }

  /**
   * Loop forwards through columns to find first which starts after the middle of the board
   */
  findNextColumnToRight() {
    const boardRect = this.boardElement.nativeElement.getBoundingClientRect();
    for (const nextCol of this.columnElements) {
      const { left, width } = nextCol.el.getBoundingClientRect();
      if (left - boardRect.left > boardRect.width / 2) {
        return {
          col: nextCol.el,
          leftToCenter: nextCol.el.offsetLeft - ((boardRect.width - width) / 2),
          last: nextCol === this.columnElements.last,
        };
      }
    }
    return {
      col: null,
      leftToCenter: 0,
      last: true,
    };
  }

  /**
   * Loop backwards through columns to find first which ends before the middle of the board
   */
  findNextColumnToLeft() {
    const boardRect = this.boardElement.nativeElement.getBoundingClientRect();
    const columns = this.columnElements.toArray();
    for (let i = columns.length - 1; i >= 0; i--) {
      const { right, width } = columns[i].el.getBoundingClientRect();
      if (right - boardRect.left < boardRect.width / 2) {
        return {
          col: columns[i].el,
          leftToCenter:
            columns[i].el.offsetLeft - ((boardRect.width - width) / 2),
          last: i === 0,
        };
      }
    }
    return {
      col: null,
      leftToCenter: 0,
      last: true,
    };
  }

  /**
   * By setting and removing 'board-dragging' class shows the cursor as grabbing
   * angular cdk removed pointer events from dragging elements so this is the easiest way.
   */
  onDragStart() {
    this.renderer.addClass(this.document.body, 'board-dragging');
  }

  onDragEnd() {
    this.renderer.removeClass(this.document.body, 'board-dragging');
  }

  scrollToTicket(ticketId) {
    for (const ticket of this.ticketElements) {
      if (ticket.el.id === ticketId) {
        const {
          top: ticketTop,
          left: ticketLeft,
          width: ticketWidth,
          height: ticketHeight
        } = ticket.el.getBoundingClientRect();
        const boardEl = this.boardElement.nativeElement;
        const {
          top: boardTop,
          left: boardLeft,
          width: boardWidth,
          height: boardHeight,
        } = boardEl.getBoundingClientRect();
        // (boardWidth - ticketWidth) / 2) is centered on the screen
        // minus this from where the ticket left is currently (also minus the boardLeft i.e. if the menu is open)
        // we're aiming to center on the visible section of board not the screen as a whole.
        // since scroll left is the absolute amount scrolled from 0, add on the current scrollLeft of the board.
        scroll.left(
          boardEl,
          ticketLeft - (boardLeft + (boardWidth - ticketWidth) / 2) + boardEl.scrollLeft,
          { duration: 600 },
          (err, success) => {
            const ticketContainer = ticket.el.parentElement;
            // ((boardHeight - ticketHeight) / 2)) is where would center the ticket in the viewport
            // ticketTop minus this is where the ticket is now relative to that position (+ / -).
            // if we add that to the current scroll position of the column then we can 'scroll.top' there to center it.
            scroll.top(
              ticketContainer,
              ticketTop - (boardTop + ((boardHeight - ticketHeight) / 2)) + ticketContainer.scrollTop,
              { duration: 600 },
              );
          }
        );
      }
    }
  }
}
