import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
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
export class BoardPage implements OnDestroy {
  @Input() boardData;
  @Input() showing;
  @Output() displayingBoardDestroyed = new EventEmitter();
  private ticketDetailModal: HTMLIonModalElement;

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController
  ) {}

    ngOnDestroy(): void {
      // if the currently displaying board is destroyed tell the board tabs page to select another
      if (this.showing) {
        this.displayingBoardDestroyed.emit();
      }
    }

  /**
   *  This is called from the ticket detail component as well so
   *  making it a function expression to stop the 'this' from changing
   */
  deleteTicket = async (ticket) => {
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
        deleteTicket: this.deleteTicket,
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

  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardData.id);
  }
}
