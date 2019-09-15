import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage implements OnInit, OnDestroy {

  public currentBoard;
  public allBoards$: Observable<any> = this.boardService.allBoardsSubject;

  constructor(
    private groupService: GroupService,
    private boardService: BoardService,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    // this is the best place for this as this page will get the url groupId when it loads,
    // even if a user comes straight here from a URL
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.groupService.setCurrentGroup(groupId);
    this.boardService.subToGroupBoards();
  }

  setCurrentBoard(allBoards) {
    this.currentBoard = allBoards[0];
    return false;
  }

  segmentChanged(ev) {
    this.currentBoard = ev.detail.value;
  }

  ngOnDestroy(): void {
    this.groupService.unSubFromUsersGroup();
    this.boardService.unSubFromGroupBoards();
  }

  boardTrackBy(index, board) {
    return board.id;
  }
}
