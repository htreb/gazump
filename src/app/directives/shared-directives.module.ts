import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from './has-permission.directive';
import { VarDirective } from './var.directive';

@NgModule({
  declarations: [
    HasPermissionDirective,
    VarDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HasPermissionDirective,
    VarDirective,
  ]
})
export class SharedDirectivesModule { }
