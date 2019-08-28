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

  public boardsForGroup$: Observable<any> = this.boardService.currentGroup$;

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardService.setGroup(groupId);
  }


}
