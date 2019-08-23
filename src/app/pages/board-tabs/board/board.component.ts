import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})

export class BoardComponent implements OnInit {

  @Input() boardData: any;
  constructor() { }

  ngOnInit() {
    if (!this.boardData) {
      console.error(`got to the board component without any board details!`);
      return;
    }

  }

  onDrag(event) {
    console.log(`dragging now`, event);
  }

  onStopDrag(event) {
    console.log('finished dragging', event);
  }
}
