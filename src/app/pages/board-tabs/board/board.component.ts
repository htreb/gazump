import { Component, OnInit, Input } from '@angular/core';
import { CdkDragEnter, moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})

export class BoardComponent implements OnInit {

  @Input() boardDetails: any;
  public states: any;

  constructor() { }

  ngOnInit() {
    if (!this.boardDetails) {
      console.error(`got to the board component without any board details!`);
      return;
    }
  }























  dropListHovered(ev: CdkDragEnter<any>) {
    // this.snapScrollToColumn(
    //   null,
    //   ev.container.element.nativeElement.getBoundingClientRect()
    // );
  }

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
    if (event.previousContainer === event.container) {
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
      try {
        // await this.ticketService.createOrUpdate(
        //   { state: event.container.data.state },
        //   event.item.data.id
        // );
      } catch (err) {
        // const alert = await this.alertCtrl.create({
        //   header: 'Error',
        //   message: err.message, // TODO more human readable error messages?
        //   buttons: ['OK']
        // });
        // alert.present();
      }
    }
  }

}
