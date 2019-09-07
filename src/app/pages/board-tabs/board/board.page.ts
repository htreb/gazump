import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BoardService } from '../../../services/board.service';
import { ActivatedRoute } from '@angular/router';
import {
  moveItemInArray,
  transferArrayItem,
  CdkDragDrop
} from '@angular/cdk/drag-drop';
import { ModalController } from '@ionic/angular';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss']
})
export class BoardPage implements OnInit {
  public board$;
  private boardId;

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private changeDetector: ChangeDetectorRef,

  ) {}

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('boardId');
    this.board$ = this.boardService.boardsFromCurrentGroup(this.boardId);
  }

  columTrackBy(index, column) {
    return column.state;
  }

  ticketTrackBy(index, ticket) {
    return ticket.id;
  }


  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.changeDetector.detectChanges();
  }

  async openTicketDetail(details) {
    const modal = await this.modalController.create({
      component: TicketDetailComponent,
      componentProps: { details }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    return console.log(data);
  }

  // TODO  delete this
  dummyTickets() {
    this.boardService.makeDummyTickets(this.boardId);
  }
}
