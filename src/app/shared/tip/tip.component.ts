import { Component, Input, HostListener } from '@angular/core';
import { TextComponent } from '../text/text.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-tip',
  templateUrl: './tip.component.html',
  styleUrls: ['./tip.component.scss'],
})
export class TipComponent {

  @Input() text;
  @Input() colour;
  private tip: HTMLIonPopoverElement;

  constructor(private popoverController: PopoverController) { }

  async showTip(ev: any) {
    this.tip = await this.popoverController.create({
      component: TextComponent,
      event: ev,
      mode: 'ios',
      cssClass: 'tip-popover',
      componentProps: {
        text: this.text,
        colour: this.colour,
      }
    });
    return await this.tip.present();
  }

  @HostListener('window:resize', ['$event'])
  closeTip(ev: any = null) {
    if (this.tip) {
      this.tip.dismiss();
    }
  }
}
