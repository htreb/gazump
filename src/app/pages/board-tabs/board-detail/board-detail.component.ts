import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ToastController, PopoverController, AlertController } from '@ionic/angular';
import { BoardService } from 'src/app/services/board.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';

const completedByNames = ['Buyers', 'Buyers Solicitors', 'Council', 'Estate Agents', 'Sellers', 'Sellers Solicitors'];
@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
})
export class BoardDetailComponent implements OnInit {

  @ViewChild('titleInput', { static: false }) titleInput: any;
  @Input() board;
  @Input() closeBoardDetail;
  @Input() deleteBoard: () => {};
  title = '';
  icon = 'clipboard';
  contacts = [this.auth.userId$.value];
  admins = [this.auth.userId$.value];
  newStateName = '';
  states = [
    {color: 'primary', id: this.db.createId(), title: 'To Do'},
    {color: 'primary', id: this.db.createId(), title: 'Doing'},
    {color: 'primary', id: this.db.createId(), title: 'Done'},
  ];
  newCompletedByName = '';
  completedBy = completedByNames.reduce((completedArr, currentName) => {
    completedArr.push({name: currentName, color: 'primary', id: this.db.createId()});
    return completedArr;
  }, []);
  disabled = false;

  constructor(
    private toastCtrl: ToastController,
    private auth: AuthService,
    private boardService: BoardService,
    private db: AngularFirestore,
    private popoverController: PopoverController,
    private alertCtrl: AlertController,
  ) { }

  async ngOnInit() {
    if (this.board) {
      this.parseBoardDataToModel(this.board);
      if (!this.admins.includes(this.auth.userId$.value)) {
        this.disabled = true;
        const alert = await this.alertCtrl.create({
          message: 'You must be an Admin to edit.',
          buttons: ['OK']
        });
        return alert.present();
      }
    }
  }

  ionViewDidEnter() {
    this.titleInput.setFocus();
  }

  parseBoardDataToModel(boardData) {
    this.title = JSON.parse(JSON.stringify(boardData.title || ''));
    this.icon = JSON.parse(JSON.stringify(boardData.icon || ''));
    this.contacts = JSON.parse(JSON.stringify(boardData.members || []));
    this.admins = JSON.parse(JSON.stringify(boardData.admins || []));
    this.states = JSON.parse(JSON.stringify(boardData.states || []));
    this.completedBy = this.boardService.getCompletedBy(boardData.id, true);
  }

  parseModelToBoardData() {
    return {
      title: this.title,
      icon: this.icon,
      members: this.contacts,
      admins: this.admins,
      states: this.states,
      completedBy: this.boardService.parseCompletedByArrayToObj(this.completedBy),
    };
  }

  async closePage(save = false) {
    if (this.disabled && save) {
      return;
    }
    this.closeBoardDetail(save && this.parseModelToBoardData());
  }

  async selectIcon(ev) {
    let popover;
    const callback = (icon) => {
      this.icon = icon;
      popover.dismiss();
    };

    popover = await this.popoverController.create({
      component: IconPickerComponent,
      componentProps: {
        currentIcon: this.icon,
        callback
      },
      event: ev,
      mode: 'md',
    });
    await popover.present();
  }

  async addState() {
    const newState = this.newStateName.trim();
    if (!newState) {
      return;
    }
    if (this.states.filter(s => s.title === newState).length === 0) {
      const stateId = this.db.createId();
      this.states.push({title: newState, color: 'primary', id: stateId});
      this.board.tickets[stateId] = [];
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

  async removeState(state) {
    if (this.board && this.board.tickets[state.id].length) {
      const toast = await this.toastCtrl.create({
        message: 'You cannot delete a state which currently has tickets in it.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    } else {
      this.states = this.states.filter(s => s.id !== state.id);
    }
  }

  reorderStates(ev) {
    this.states = ev.detail.complete(this.states);
  }

  async addCompletedBy() {
    const trimmedCB = this.newCompletedByName.trim();
    if (!trimmedCB) {
      return;
    }
    if (this.completedBy.filter(cb => cb.name === trimmedCB).length === 0) {
      this.completedBy.push({ name: trimmedCB, color: 'primary', id: this.db.createId() });
      this.newCompletedByName = '';
    } else {
      const toast = await this.toastCtrl.create({
        message: 'That completed by already exists',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  removeCompletedBy(completedBy: any) {
    this.completedBy = this.completedBy.filter(cb => cb.id !== completedBy.id);
  }
}
