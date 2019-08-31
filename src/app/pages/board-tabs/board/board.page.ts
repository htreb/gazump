import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import * as debounce from 'debounce-promise';
import { ModalController } from '@ionic/angular';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit, OnDestroy {
  board$;
  private boardId: string;
  private newTicketSequence = {};
  private debouncedUpdateBoard = debounce(function() {
    return this.boardService.updateBoard(...arguments);
  }, 100); // the debounce delay can be tweaked
  @ViewChild('columnHeaderContainer', {static: false}) columnHeaderContainer: any;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    // I shouldn't need to save this if it's coming down with the board
    this.boardId = this.route.snapshot.paramMap.get('boardId');
    this.board$ = this.boardService.boardsFromCurrentGroup(this.boardId);
  }

  ngOnDestroy() {
    // in case page is destroyed before a debounced call completes
    this.boardService.updateBoard(this.boardId, this.newTicketSequence).then(() => {
      console.log('updated board');
      this.newTicketSequence = {};
    });
  }

  /**
   * keeps column headers lined up with the board
   * @param event scroll event from board
   */
  onBoardScroll(event) {
    const boardLeft = event.srcElement.scrollLeft;
    this.columnHeaderContainer.nativeElement.scroll(boardLeft, 0);
  }

  onTicketDrop(column, tickets, dropResult) {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      const newTickets = this.applyDrag(tickets, dropResult);
      this.newTicketSequence[`tickets.${column.state}`] = newTickets;
      this.debouncedUpdateBoard(this.boardId, this.newTicketSequence).then(() => {
        console.log('updated board');
        this.newTicketSequence = {};
      });
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


  async openTicketDetail(details) {
    const modal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: {details}
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    return console.log(data);
  }


  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardId);
  }
}
