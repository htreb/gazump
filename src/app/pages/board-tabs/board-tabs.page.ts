import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage implements OnInit {

  public boardTitle = this.boardService.currentBoardTitle;
  public allBoards$: Observable<any> = this.boardService.boardsFromCurrentGroup();

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardService.setGroup(groupId); // TODO set this when navigating on the list-groups page
  }
}
