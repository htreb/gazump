import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragEnter
} from '@angular/cdk/drag-drop';
import { AlertController, IonContent } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit {
  public columns = [
    {
      title: 'To do',
      state: '0',
      tickets: []
    },
    {
      title: 'In progress',
      state: '1',
      tickets: []
    },
    {
      title: 'Done',
      state: '2',
      tickets: []
    }
  ];

  @ViewChild(IonContent) content: IonContent;

  columnElements;
  contentRect;
  snapScrolling = false; // flag when currently snap scrolling the page

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private alertCtrl: AlertController,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.ticketService
      .getUserTickets()
      .pipe(takeUntil(this.auth.loggedOutSubject))
      .subscribe((tickets: any) => {
        this.columns.forEach(column => {
          column.tickets = tickets.filter(t => t.state === column.state);
        });
        setTimeout(() => {
          this.resize();
        }, 500);
      });
  }

  /**
   * Navigate to the menu/ticket page
   */
  addTicket() {
    this.router.navigateByUrl('menu/ticket');
  }

  /**
   * Moves the element into its new position.
   * Calls update on the ticket service to sync with the db
   * if it fails will warn the user with an alert
   * @param event
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
        await this.ticketService.createOrUpdate(
          { state: event.container.data.state },
          event.item.data.id
        );
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

  seeMore(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    return this.router.navigate(['menu/ticket'], navigationExtras);
  }

  /**
   * Get the full width of the board (used to calculate how far to snap scroll)
   * and the columnElements
   */
  @HostListener('window:resize', ['$event'])
  async resize(ev = null) {
    // console.log('the screen has been resized', ev);
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
    if (this.snapScrolling) { return; }
    this.snapScrolling = true;

    // make sure we have columns and contentWidth at this point.
    if (!this.contentRect || !this.columnElements) { await this.resize(); }

    if (!nextColumnRect) {
      // get the column to aim for
      nextColumnRect = right ? await this.nextColumn() : await this.previousColumn();
    }

    // (screenWidth - column width) = 'space' on each side of column
    const leftToCenterColumn = (this.contentRect.width - nextColumnRect.width) / 2;

    // so left offset should be (column left - menu if open) - leftToCenterColumn
    const scrollHere = nextColumnRect.left - this.contentRect.left - leftToCenterColumn;
    this.content.scrollByPoint(scrollHere, 0, 800)
    .then(() => {
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
      if ((nextColumnRect.left - this.contentRect.left) > (this.contentRect.width / 2)) {
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
      if ((previousColumnRect.right - this.contentRect.left)  < (this.contentRect.width / 2)) {
        break;
      }
    }
    return previousColumnRect;
  }


  /**
   * fired every time a drag item moves.
   * @param event drag event
   */
  async onTicketDrag(event) {
    if (event.event.movementX > 3 && event.pointerPosition.x > this.contentRect.right - 50) {
      return this.snapScrollToColumn();
    }
    if (event.event.movementX < -3 && event.pointerPosition.x < this.contentRect.left + 50) {
      return this.snapScrollToColumn(false);
    }
  }

  dropListHovered(ev: CdkDragEnter<any>) {
    this.snapScrollToColumn(null, ev.container.element.nativeElement.getBoundingClientRect());
  }

  /**
   * Create a bunch of dummy tickets with random states
   * TODO remove this
   */
  dummyTickets() {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        this.ticketService.createOrUpdate({
          title: 'Ticket ' + i,
          description: `This is a short description about how ${i} is just such a great ticket.`,
          completedBy: null,
          eta: null,
          state: Math.floor(Math.random() * 3) + '',
        })
      );
    }
    Promise.all(promises).then(() => {
      console.log('All done! Dummy tickets made!');
    });
  }
}
