import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BoardPage } from './board.page';
import { NgxSmoothDnDModule } from 'ngx-smooth-dnd';

const routes: Routes = [
  {
    path: '',
    component: BoardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxSmoothDnDModule,

  ],
  declarations: [BoardPage]
})
export class BoardPageModule {}
