import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
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
  contentWidth;

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
    this.contentWidth = scrollRect[0].width;
  }

  /**
   * Finds the next column and snap scrolls it to the center of the screen
   * @param right direction (defaults to right)
   */
  async snapScrollToColumn(right = true) {
    // make sure we have columns and contentWidth at this point.
    if (!this.contentWidth || !this.columnElements) { await this.resize(); }
    const nextColumnRect = right ? await this.nextColumn() : await this.previousColumn();

    // (screenWidth - column width) = 'space' on each side of column
    const leftToCenterColumn = (this.contentWidth - nextColumnRect.width) / 2;
    // so left offset should be column left - above value
    this.content.scrollByPoint(nextColumnRect.left - leftToCenterColumn, 0, 500);
  }


  /**
   * Loop forwards through columns to find first which starts after the middle of the screen
   */
  async nextColumn() {
    let nextColumnRect;
    for (const col of this.columnElements) {
      nextColumnRect = col.getBoundingClientRect();
      if (nextColumnRect.left > (this.contentWidth / 2)) {
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
      if (previousColumnRect.right < (this.contentWidth / 2)) {
        break;
      }
    }
    return previousColumnRect;
  }

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
          state: ['0', '1', '2'][Math.floor(Math.random() * 3)]
        })
      );
    }
    Promise.all(promises).then(() => {
      console.log('All done! Dummy tickets made!');
    });
  }
}
