import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BoardService } from '../../../services/board.service';
import { ActivatedRoute } from '@angular/router';
import {
  moveItemInArray,
  transferArrayItem,
  CdkDragDrop
} from '@angular/cdk/drag-drop';
import { ModalController, AlertController } from '@ionic/angular';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit, OnDestroy {
  public boardDataSub;
  public board;

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    this.boardDataSub = this.boardService.boardsFromCurrentGroup(boardId).subscribe(boardData => {
      this.board = boardData;
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.boardDataSub) {
      this.boardDataSub.unsubscribe();
    }
  }

  columTrackBy(index, column) {
    return column.state;
  }

  ticketTrackBy(index, ticket) {
    return ticket.id;
  }

  async drop(event) {
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
      updatedTickets[`tickets.${event.previousContainer.data.state}`] =
        event.previousContainer.data.tickets;
    }
    updatedTickets[`tickets.${event.container.data.state}`] =
      event.container.data.tickets;
    try {
      await this.boardService.updateBoard(this.board.id, updatedTickets);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message, // TODO more human readable error messages?
        buttons: ['OK']
      });
      alert.present();
    }
    this.changeDetector.detectChanges();
  }

  async openTicketDetail(details) {
    const modal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: { details }
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
