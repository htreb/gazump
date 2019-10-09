import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void => *', [animate('0.6s 0.0s ease-out')]),
      transition('* => void', [animate('0.6s 0.0s ease-in')])
    ])
  ]
})
export class LoadingComponent {

  @Input() show = true;
  constructor() { }
}
