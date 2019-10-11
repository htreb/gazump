import { Pipe, PipeTransform } from '@angular/core';
import { BoardService } from 'src/app/services/board.service';
import { takeWhile, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
  name: 'ticketTitle'
})
export class TicketTitlePipe implements PipeTransform {
  constructor(private boardService: BoardService) {}

  transform(ticketId: any, ...args: any[]) {
    return this.boardService.allBoardsSubject
      .pipe(
        map(boards => {
          if (boards.loading) {
            return '...';
          }
          // subscription complete. allBoards have loaded now
          const { ticketSnippet } = this.boardService.findTicketPositionDetails(ticketId);
          return ticketSnippet && ticketSnippet.title || 'Deleted';
        })
      );
  }
}
