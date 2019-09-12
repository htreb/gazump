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
  private closeTipTimeout;
  private mouseMovedSinceLastShow = true;

  constructor(private popoverController: PopoverController) { }

  async showTip(ev: any, fromMouseOver = false) {
    if (fromMouseOver && !this.mouseMovedSinceLastShow) { return; }
    clearTimeout(this.closeTipTimeout);
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
    this.closeTipTimeout = setTimeout(_ => this.closeTip(), 3000);
    return await this.tip.present();
  }
  mouseMoved() {
    this.mouseMovedSinceLastShow = true;
  }

  @HostListener('window:resize', ['$event'])
  closeTip(ev: any = null) {
    clearTimeout(this.closeTipTimeout);
    if (this.tip) {
      this.tip.dismiss();
    }
    this.mouseMovedSinceLastShow = false;
  }

}
