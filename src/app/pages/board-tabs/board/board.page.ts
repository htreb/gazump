import { Component, OnInit, Input } from '@angular/core';
import { BoardService } from '../../../services/board.service';
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
export class BoardPage implements OnInit {
  @Input() data;

  constructor(
    private boardService: BoardService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {
  }


  columTrackBy(index, column) {
    return column.state;
  }

  ticketTrackBy(index, ticket) {
    return ticket.id;
  }

  async drop(event: CdkDragDrop<any>) {
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
      await this.boardService.updateBoard(this.data.id, updatedTickets);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message, // TODO more human readable error messages?
        buttons: ['OK']
      });
      alert.present();
    }
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
    this.boardService.makeDummyTickets(this.data.id);
  }
}
