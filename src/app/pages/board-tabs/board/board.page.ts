import { Component, OnInit, Input } from '@angular/core';
import { BoardService } from '../../../services/board.service';
import {
  moveItemInArray,
  transferArrayItem,
  CdkDragDrop
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
export class BoardPage implements OnInit {
  @Input() boardData;
  @Input() showing;

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  getColumnIds() {
    const ids = [];
    if (this.boardData.states) {
      this.boardData.states.forEach(s =>
        ids.push(`${this.boardData.id.toLowerCase()}${s.id}`)
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

  async openTicketDetail(currentTicketSnippet: any, currentState: any) {
    const modal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: {
        currentTicketSnippet,
        currentState,
        completedBy: this.boardData.completedBy,
        allStates: this.boardData.states
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.saveTicket) {
      if (data.ticketFormValue.id) {
        // updating a ticket which already exists
        this.boardService.updateTicketSnippet(
          this.boardData.id,
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

  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardData.id);
  }
}
