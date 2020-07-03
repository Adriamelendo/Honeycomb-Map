import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ItemsListComponent } from './items-list.component';
import { ItemComponentModule } from '../item/item.module';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, RouterModule, ItemComponentModule],
  declarations: [ItemsListComponent],
  exports: [ItemsListComponent]
})
export class ItemsListComponentModule {}
