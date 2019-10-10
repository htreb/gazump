import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { icons } from './icon-list';
import { ToastController, AlertController } from '@ionic/angular';
import { ContactService } from 'src/app/services/contact.service';

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
  icons = icons;
  contacts = [this.contactService.getDetailsFromId('', true)];
  newStateName = '';
  states = [
    {color: 'medium', id: this.getId(), title: 'To Do'},
    {color: 'medium', id: this.getId(), title: 'Doing'},
    {color: 'medium', id: this.getId(), title: 'Done'},
  ];

  newCompletedByName = '';
  completedBy = [
    {color: 'medium', id: this.getId(), name: 'Buyers'},
    {color: 'medium', id: this.getId(), name: 'Buyers Solicitors'},
    {color: 'medium', id: this.getId(), name: 'Council'},
    {color: 'medium', id: this.getId(), name: 'Estate Agents'},
    {color: 'medium', id: this.getId(), name: 'Sellers'},
    {color: 'medium', id: this.getId(), name: 'Sellers Solicitors'},
  ];

  constructor(
    private toastCtrl: ToastController,
    private contactService: ContactService,
    private alertCtrl: AlertController,
  ) { }

  ionViewDidEnter() {
    this.titleInput.setFocus();
  }

  getId() {
    return `${(Math.random() + '').substr(2)}X${new Date().getTime()}`;
  }

  ngOnInit() {
    if (this.board) {
      this.parseBoardDataToModel(this.board);
    }
  }

  parseBoardDataToModel(boardData) {
    this.title = JSON.parse(JSON.stringify(boardData.title));
    this.contacts = boardData.members.map(memberId => this.contactService.getDetailsFromId(memberId));
    this.states = JSON.parse(JSON.stringify(boardData.states));
    this.completedBy = JSON.parse(JSON.stringify(boardData.completedBy));
  }

  parseModelToBoardData() {
    return {
      members: this.contacts.map(c => c.id),
      title: this.title,
      states: this.states,
      completedBy: this.completedBy
    };
  }

  async closePage(save = false) {
    this.closeBoardDetail(save && this.parseModelToBoardData());
  }

  async addState() {
    const newState = this.newStateName.trim();
    if (!newState) {
      return;
    }
    if (this.states.filter(s => s.title === newState).length === 0) {
      this.states.push({title: newState, color: 'medium', id: this.getId()});
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
    // TODO block deleting a state which has tickets on it!
    if (this.board.tickets[state.id].length) {
      const alert = await this.alertCtrl.create({
        header: 'Warning',
        message: `You cannot delete a state which currently has tickets in it.`,
        buttons: ['OK'],
        });
      alert.present();
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
      this.completedBy.push({ name: trimmedCB, color: 'medium', id: this.getId() });
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

  reorderCompletedBy(ev) {
    this.completedBy = ev.detail.complete(this.completedBy);
  }
}
