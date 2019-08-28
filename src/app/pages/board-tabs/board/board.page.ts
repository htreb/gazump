import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService) { }

  ngOnInit() {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    const boardData = this.boardService.currentGroupSubject.value;

    console.log(`the board data I have is`, boardData);
  }

}
