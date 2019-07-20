import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.page.html',
  styleUrls: ['./ticket.page.scss']
})
export class TicketPage implements OnInit {
  ticketForm: FormGroup;
  loading: HTMLIonLoadingElement;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    ) {}

  ngOnInit() {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      completedBy: [''],
      eta: [''],
      state: ['0'],
    });
  }

  /**
   * Saves the ticket in future this will update a current ticket too
   */
  async saveTicket() {
    this.loading = await this.loadingCtrl.create({
      message: 'Saving...'
    });
    await this.loading.present();

    this.ticketService.createOrUpdate(this.ticketForm.value).then(
      () => {
        this.loading.dismiss();
        this.navCtrl.navigateBack('/menu/board');
      },
      async err => {
        this.loading.dismiss();
        const errorAlert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message, // TODO more human readable error messages?
          buttons: ['OK']
        });
        errorAlert.present();
      }
    );
  }
}
