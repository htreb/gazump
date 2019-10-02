import { Component, OnInit, Input } from '@angular/core';
import { icons } from './icon-list';
import { ToastController, PopoverController } from '@ionic/angular';
import { ContactPickerComponent } from 'src/app/shared/contact-picker/contact-picker.component';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss'],
})
export class BoardDetailComponent implements OnInit {

  @Input() board;
  @Input() closeBoardDetail;
  title = '';
  icons = icons;
  contacts;
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
    private popoverController: PopoverController,
    private contactService: ContactService,
  ) { }

  getId() {
    return `${(Math.random() + '').substr(2)}X${new Date().getTime()}`;
  }

  ngOnInit() {
    this.parseBoardDataToModel(this.board);
  }

  parseBoardDataToModel(boardData) {
    this.title = JSON.parse(JSON.stringify(boardData.title));
    this.contacts = Object.keys(boardData.members).map(memberId => this.contactService.getDetailsFromId(memberId));
    this.states = JSON.parse(JSON.stringify(boardData.states));
    this.completedBy = JSON.parse(JSON.stringify(boardData.completedBy));
  }

  parseModelToBoardData() {
    const members = {};
    this.contacts.map(c => members[c.id] = 'USER');

    return {
      members,
      title: this.title,
      states: this.states,
      completedBy: this.completedBy
    };
  }

  async closePage(save = false) {
    if (save) {
      return console.log(this.parseModelToBoardData());
    }
    this.closeBoardDetail();
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

  removeState(state) {

    // TODO block deleting a state which has tickets on it!
    this.states = this.states.filter(s => s.id !== state.id);
  }

  reorderStates(ev) {
    this.states = ev.detail.complete(this.states);
  }

  async selectContacts() {
    const popover = await this.popoverController.create({
      component: ContactPickerComponent,
      componentProps: {
        dismissPopover,
      },
      cssClass: 'contact-picker',
    });

    function dismissPopover(args) {
      return popover.dismiss(args);
    }
    await popover.present();
    const { data } = await popover.onWillDismiss();
    console.log('data is ', data);
    if (data && data.contacts) {
      this.contacts = data.contacts;
    }
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
