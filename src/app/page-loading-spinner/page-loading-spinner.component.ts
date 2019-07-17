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
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void => *', [animate('.2s 0s ease-out')]),
      // when removing component fade out over duration of 0.2 seconds,
      // but start after a 0.3 delay (give page time to load behind)
      transition('* => void', [animate('0.2s 0.3s ease-in')])
    ])
  ]
})
export class PageLoadingSpinnerComponent implements OnInit {
  constructor(public authGuard: AuthGuard) {}

  ngOnInit() {}
}
