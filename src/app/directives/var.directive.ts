import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appVar]',
  exportAs: 'appVar'
})
export class VarDirective {
  val: any;

  @Input('appVar') set assign(value: any) {
      this.val = value;
  }
}
