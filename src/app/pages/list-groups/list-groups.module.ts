import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ListGroupsPage } from './list-groups.page';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: ListGroupsPage
  },
  {
    path: 'create',
    loadChildren: () => import('../create-group/create-group.module').then(m => m.CreateGroupPageModule)
  },
  {
    path: ':groupId',
    loadChildren: () => import('../menu/menu.module').then(m => m.MenuPageModule),
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [ListGroupsPage]
})
export class ListGroupsPageModule {}
