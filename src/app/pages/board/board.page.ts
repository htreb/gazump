import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { TicketService } from 'src/app/services/ticket.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { AlertController } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit {
  public states = [
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
        this.states.forEach(column => {
          column.tickets = tickets.filter(t => t.state === column.state);
        });
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
