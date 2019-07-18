import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PickerController } from '@ionic/angular';
import { PickerOptions } from '@ionic/core';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.page.html',
  styleUrls: ['./ticket.page.scss']
})
export class TicketPage implements OnInit {
  ticketForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private pickerCtrl: PickerController) {}

  ngOnInit() {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      completedBy: [''],
      duration: [{time: '', unit: ''}],
      status: ['0'],
    });
  }

  async pickDuration() {
    const options = [];
    for (let i = 1; i <= 30; i++) {
      options.push({text: i, value: i});
    }
    const opts: PickerOptions = {
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Done',
          handler: (resp: any): void => {
            this.ticketForm.patchValue({
              duration: { time: resp.amount.value, unit: resp.unit.value},
            });
          }
        }
      ],
      columns: [
        {
          name: 'amount',
          options,
        },
        {
          name: 'unit',
          options: [
            {text: 'Hours', value: 1},
            {text: 'Days', value: 24},
            {text: 'Weeks', value: 168},
            {text: 'Months', value: 720},
          ],
        },
      ]
    };
    const picker = await this.pickerCtrl.create(opts);
    picker.present();
  }

  logTicket() {
    console.log(this.ticketForm.value);
  }
}
