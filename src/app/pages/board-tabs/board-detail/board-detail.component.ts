import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { icons } from './icon-list';
import { ToastController } from '@ionic/angular';
import { ContactService } from 'src/app/services/contact.service';
import { BoardService } from 'src/app/services/board.service';
import { AngularFirestore } from '@angular/fire/firestore';

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
  icons = icons;
  contacts = [this.contactService.getMyDetails()];
  newStateName = '';
  states = [
    {color: 'medium', id: this.db.createId(), title: 'To Do'},
    {color: 'medium', id: this.db.createId(), title: 'Doing'},
    {color: 'medium', id: this.db.createId(), title: 'Done'},
  ];

  newCompletedByName = '';
  completedBy = completedByNames.reduce((completedArr, currentName) => {
    completedArr.push({name: currentName, color: 'medium', id: this.db.createId()});
    return completedArr;
  }, []);


  constructor(
    private toastCtrl: ToastController,
    private contactService: ContactService,
    private boardService: BoardService,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    if (this.board) {
      this.parseBoardDataToModel(this.board);
    }
  }

  ionViewDidEnter() {
    this.titleInput.setFocus();
  }

  parseBoardDataToModel(boardData) {
    this.title = JSON.parse(JSON.stringify(boardData.title));
    this.contacts = boardData.members.map(memberId => this.contactService.getDetailsFromId(memberId));
    this.states = JSON.parse(JSON.stringify(boardData.states));
    this.completedBy = this.boardService.getCompletedBy(boardData.id, true);
  }

  parseModelToBoardData() {
    return {
      members: this.contacts.map(c => c.id),
      title: this.title,
      states: this.states,
      completedBy: this.boardService.parseCompletedByArrayToObj(this.completedBy),
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
      const stateId = this.db.createId();
      this.states.push({title: newState, color: 'medium', id: stateId});
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
      this.completedBy.push({ name: trimmedCB, color: 'medium', id: this.db.createId() });
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
