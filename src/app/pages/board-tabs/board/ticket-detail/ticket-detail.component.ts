import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit {

  @Input() details;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  closePage() {
    console.log('Kill me!!');
    this.modalCtrl.dismiss({
      message: 'Tell my wife I said hello...',
    });
  }
}
