import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.page.html',
  styleUrls: ['./board-tabs.page.scss'],
})
export class BoardTabsPage implements OnInit, OnDestroy {

  public title: string;
  private boardTitleSub: Subscription;

  public allBoards$: Observable<any> = this.boardService.boardsFromCurrentGroup();

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
    ) { }

  ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.boardService.setGroup(groupId); // TODO set this when navigating on the list-groups page

    this.boardTitleSub = this.boardService.currentBoardTitle.asObservable().subscribe(newTitle => {
      this.title = newTitle;
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.boardTitleSub && this.boardTitleSub.unsubscribe) {
      this.boardTitleSub.unsubscribe();
    }
    this.boardService.unSubFromGroup();
  }

  boardTrackBy(index, board) {
    return board.id;
  }
}
