import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewItemPage } from './view-item.page';

const routes: Routes = [
  {
    path: '',
    component: ViewItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewItemPageRoutingModule {}
