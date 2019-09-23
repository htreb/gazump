import { Component, OnInit, HostListener, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BoardService } from 'src/app/services/board.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-picker',
  templateUrl: './ticket-picker.component.html',
  styleUrls: ['./ticket-picker.component.scss']
})
export class TicketPickerComponent implements OnInit {
  filteredBoards$;
  searchTerm$ = new BehaviorSubject<string>('');
  @Input() selectedTickets = [];

  constructor(
    private popover: PopoverController,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    this.filteredBoards$ = combineLatest([
      this.boardService.allBoardsSubject,
      this.searchTerm$
    ]).pipe(
      map(([allBoards, searchTerm]) => {
        return this.filterShowingTickets(allBoards, searchTerm);
      })
    );
  }

  updateSearchTerm(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  /**
   * copies all the current boards
   * filters to find the tickets which match the search term
   * if no tickets match in a state, removes the state too,
   * if no states left, then removes the board as well.
   * (on a board tickets is an object, states is an array)
   * @param allBoards from the allBoardsSubject
   * @param searchTerm from the searchTerm input
   */
  filterShowingTickets(allBoards: any, searchTerm: string) {
    if (allBoards.loading) {
      return allBoards;
    }
    searchTerm = searchTerm.toLowerCase();
    const boards = JSON.parse(JSON.stringify(allBoards));
    boards.forEach((board: any) =>
      Object.keys(board.tickets).forEach((state: string) => {
        board.tickets[state] = board.tickets[state].filter(
          (ticket: any) => ticket.title.toLowerCase().indexOf(searchTerm) > -1
        );
        if (!board.tickets[state].length) {
          delete board.tickets[state];
          board.states = board.states.filter(s => s.id !== state);
        }
      })
    );
    return boards.filter(b => b.states.length);
  }

  @HostListener('window:resize', ['$event'])
  closeTicketPicker(ev: any = null, attachTickets = false) {
    if (this.popover) {
      this.popover.dismiss({
        tickets: attachTickets && this.selectedTickets
      });
    }
  }

  ticketSelected(ev, ticket) {
    const idx = this.findTicket(ticket);
    if (ev.detail.checked && idx === -1) {
      this.selectedTickets.push(ticket);
    } else if (!ev.detail.checked && idx > -1) {
      this.selectedTickets.splice(idx, 1);
    }
  }

  findTicket(ticket) {
    let idx = -1;
    this.selectedTickets.forEach((t, i) => {
      if (t.id === ticket.id) {
        idx = i;
      }
    });
    return idx;
  }
}
