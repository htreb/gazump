import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-ticket-detail-or-board',
  templateUrl: './ticket-detail-or-board.component.html',
  styleUrls: ['./ticket-detail-or-board.component.scss'],
})
export class TicketDetailOrBoardComponent {

  @Input() ticketId;
  @Input() dismiss;

  constructor(
    private groupService: GroupService,
    private router: Router
    ) { }

  showTicketDetails() {
    console.log('show me details');
    this.dismiss();
  }

  async showTicketOnBoard() {
    await this.router.navigate(
      [
        '/',
        'group',
        this.groupService.currentGroupId,
        'boards'
      ],
      { queryParams:
        {
          ticket:
          this.ticketId
        }
      }
    );
    this.dismiss();
  }

}
