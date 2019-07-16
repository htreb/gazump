import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../guards/auth.guard';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-page-loading-spinner',
  templateUrl: './page-loading-spinner.component.html',
  styleUrls: ['./page-loading-spinner.component.scss'],

  animations: [
      trigger('fadeIn', [
        // state('in', style({
        //   opacity: 1,
        // })),
        transition(':enter', [
          style({opacity: 0}),
          animate('.3s')
        ]),
        transition('* => void', [
          animate('.3s .3s', style({opacity: 0}))
        ]),
      ]),
    ]

})
export class PageLoadingSpinnerComponent implements OnInit {

  constructor(public authGuard: AuthGuard) { }

  ngOnInit() {}


}
