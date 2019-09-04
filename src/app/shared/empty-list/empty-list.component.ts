import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
})
export class EmptyListComponent implements OnInit {

  @Input() listType: string;
  public message = 'Empty List';

  constructor() { }

  ngOnInit() {
    if (this.listType) {
      this.message = `You are not in any ${this.listType}.`;
    }
  }

}
