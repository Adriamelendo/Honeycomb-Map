import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';
import { MapHeaderComponent } from './map-header/map-header.component';
import { HexContentsComponent } from './hex-contents/hex-contents.component';
import { RegionCardComponent } from './region-card/region-card.component';
import { ResourcesCardComponent } from './resources-card/resources-card.component';
import { ResourceItemComponent } from './resource-item/resource-item.component';

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
    RegionCardComponent,
    ResourcesCardComponent,
    ResourceItemComponent,
  ]
})
export class MapPageModule {}
