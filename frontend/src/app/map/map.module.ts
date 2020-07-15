import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';
import { MapHeaderComponent } from './map-header/map-header.component';
import { HexContentsComponent } from './hex-contents/hex-contents.component';
import { ItemComponent } from './item/item.component';

import { MapPage } from './map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
  ],
  declarations: [
    MapPage,
    MapHeaderComponent,
    HexContentsComponent,
    ItemComponent,
  ]
})
export class MapPageModule {}
