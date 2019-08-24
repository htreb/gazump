import { Component, Input } from '@angular/core';
import { TicketService } from 'src/app/services/ticket.service';
import { AlertController } from '@ionic/angular';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';


@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})

export class BoardComponent {

  @Input() boardData: any;
  @Input() groupId: string;

  constructor(
    private ticketService: TicketService,
    private alertCtrl: AlertController,
  ) { }

  /**
   * Moves the element into its new position.
   * Calls update on the ticket service to sync with the db
   * if it fails will warn the user with an alert
   * @param event drop event
   */
  async drop(event: CdkDragDrop<any>) {
    if (!event.item.data) {
      console.log('Tried to move a ticket with no item data');
      return;
    }
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
      updatedTickets[`tickets.${event.previousContainer.data.state}`] = event.previousContainer.data.tickets;
    }
    updatedTickets[`tickets.${event.container.data.state}`] = event.container.data.tickets;
    try {
      await this.ticketService.updateBoardTickets(this.groupId, this.boardData.id, updatedTickets);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message, // TODO more human readable error messages?
        buttons: ['OK']
      });
      alert.present();
    }
  }
}
