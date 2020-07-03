import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';
import { ItemsListComponentModule } from './items-list/items-list.module';
import { MapHeaderComponentModule } from './map-header/map-header.module';

import { MapPage } from './map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    ItemsListComponentModule,
    MapHeaderComponentModule
  ],
  declarations: [MapPage]
})
export class MapPageModule {}
