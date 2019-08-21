import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { CdkDragEnter, moveItemInArray, transferArrayItem, CdkDragDrop, CdkDragMove } from '@angular/cdk/drag-drop';
import { TicketService } from 'src/app/services/ticket.service';
import { AlertController, IonContent } from '@ionic/angular';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})

export class BoardComponent implements OnInit {

  @Input() boardData: any;
  @Input() groupId: string;
  @Input() currentBoardId: string;
  @Input() content: IonContent;
  private columnElements: any;
  private contentRect: any;
  private snapScrolling = false; // flag when currently snap scrolling the page

  private scrolling = false;

  constructor(
    private ticketService: TicketService,
    private alertCtrl: AlertController,
    ) { }

  ngOnInit() {
    if (!this.boardData) {
      console.error(`got to the board component without any board details!`);
      return;
    }
    this.resize();
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
      await this.ticketService.updateBoardTickets(this.groupId, this.currentBoardId, updatedTickets);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message, // TODO more human readable error messages?
        buttons: ['OK']
      });
      alert.present();
    }
  }

  /**
   * Get the full width of the board (used to calculate how far to snap scroll)
   * and the columnElements
   */
  @HostListener('window:resize', ['$event'])
  async resize(ev = null) {
    this.columnElements = document.getElementsByClassName(
      'column-header-footer-container'
    );
    const scrollEl = await this.content.getScrollElement();
    const scrollRect = scrollEl.getClientRects();
    this.contentRect = scrollRect[0];
  }

  /**
   * Finds the next column and snap scrolls it to the center of the screen
   * @param right direction (defaults to right)
   */
  async snapScrollToColumn(right = true, nextColumnRect = null) {
    // if currently running don't retry
    if (this.snapScrolling) {
      return;
    }
    this.snapScrolling = true;

    // make sure we have columns and contentWidth at this point.
    if (!this.contentRect || !this.columnElements) {
      await this.resize();
    }

    if (!nextColumnRect) {
      // get the column to aim for
      nextColumnRect = right
        ? await this.nextColumn()
        : await this.previousColumn();
    }

    // (screenWidth - column width) = 'space' on each side of column
    const leftToCenterColumn =
      (this.contentRect.width - nextColumnRect.width) / 2;

    // so left offset should be (column left - menu if open) - leftToCenterColumn
    const scrollHere =
      nextColumnRect.left - this.contentRect.left - leftToCenterColumn;
    this.content.scrollByPoint(scrollHere, 0, 800).then(() => {
      this.snapScrolling = false;
    });
  }

  /**
   * Loop forwards through columns to find first which starts after the middle of the screen
   */
  async nextColumn() {
    let nextColumnRect;
    for (const col of this.columnElements) {
      nextColumnRect = col.getBoundingClientRect();
      if (
        nextColumnRect.left - this.contentRect.left >
        this.contentRect.width / 2
      ) {
        break;
      }
    }
    return nextColumnRect;
  }

  /**
   * Loop backwards through columns to find first which ends before the middle of the screen
   */
  async previousColumn() {
    let previousColumnRect;
    for (let i = this.columnElements.length - 1; i >= 0; i--) {
      previousColumnRect = this.columnElements[i].getBoundingClientRect();
      if (
        previousColumnRect.right - this.contentRect.left <
        this.contentRect.width / 2
      ) {
        break;
      }
    }
    return previousColumnRect;
  }

  /**
   * Fired every time a drag item moves.
   * Check if cursor is at either edge of the screen (and moving that way).
   * If so then snap scroll that way.
   * @param event drag event
   */
  onTicketDrag(event: CdkDragMove) {
    if (this.scrolling) {
      return;
    }
    this.scrolling = true;
    if (
      event.delta.x > 0 &&
      event.pointerPosition.x > this.contentRect.right - 50
    ) {
      return this.content.scrollByPoint(20, 0, 500).then(resp => {
        console.log('finished scrolling', resp);
        this.scrolling = false;
      });
      // return this.snapScrollToColumn();
    }
    if (
      event.delta.x < 0 &&
      event.pointerPosition.x < this.contentRect.left + 50
    ) {
      return this.content.scrollByPoint(-20, 0, 500).then(resp => {
        console.log('finished scrolling', resp);
        this.scrolling = false;
      });
      // return this.snapScrollToColumn(false);
    }
  }




  // dropListHovered(ev: CdkDragEnter<any>) {
  //   this.snapScrollToColumn(
  //     null,
  //     ev.container.element.nativeElement.getBoundingClientRect()
  //   );
  // }

}
