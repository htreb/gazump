import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { icons } from './icon-list';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
})
export class BoardDetailComponent implements OnInit {

  @Input() board;
  @Input() closeBoardDetail;
  icons = icons;
  newStateName = '';
  states = [
    'To Do',
    'Doing',
    'Done'
  ];

  public boardForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.boardForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required]],
      icon: [''],
      states: [''],
      members: [''],
      completedBy: [''],
    });
    if (this.board) {
      this.boardForm.patchValue(this.board);
    }
  }

  async closePage(save = false) {
    this.closeBoardDetail();
  }

  async addState() {
    if (!this.newStateName.trim()) {
      return;
    }
    if (this.states.indexOf(this.newStateName) === -1) {
      this.states.push(this.newStateName);
      this.newStateName = '';
    } else {
      const toast = await this.toastCtrl.create({
        message: 'That state already exists',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  removeState(state: string) {
    this.states = this.states.filter(s => s !== state);
  }

  reorderStates(ev) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    console.log('states before:', this.states);
    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    this.states = ev.detail.complete(this.states);
    // After complete is called the items will be in the new order
    console.log('states after:', this.states);
  }

}
