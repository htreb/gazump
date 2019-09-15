import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage implements OnInit, OnDestroy {

  public currentBoard;
  public allBoards$: Observable<any> = this.boardService.boardsFromCurrentGroup();

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardService.setGroup(groupId); // TODO set this when navigating on the list-groups page
  }

  setCurrentBoard(allBoards) {
    this.currentBoard = allBoards[0];
    return false;
  }

  segmentChanged(ev) {
    this.currentBoard = ev.detail.value;
  }

  ngOnDestroy(): void {
    this.boardService.unSubFromGroup();
  }

  boardTrackBy(index, board) {
    return board.id;
  }
}
