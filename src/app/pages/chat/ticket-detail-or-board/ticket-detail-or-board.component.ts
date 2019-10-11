import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { ModalController } from '@ionic/angular';
import { TicketDetailComponent } from '../../../shared/ticket-detail/ticket-detail.component';

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
    private router: Router,
    private modalController: ModalController,
    ) { }


  async showTicketDetails() {
    const ticketDetailModal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: {
        ticketId: this.ticketId,
        dismiss,
      }
    });

    function dismiss() {
      if (typeof ticketDetailModal.dismiss === 'function') {
        ticketDetailModal.dismiss();
      }
    }

    await ticketDetailModal.present();
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
