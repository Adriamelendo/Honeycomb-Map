import { Component, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import {
  HCMapDataService,
  HCMapRegion,
  HCMapResource,
  HexContents
} from '../services/hcmap-data.service';
import { Item } from '../interfaces/item';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  private map: Leaflet.Map;

  private hexLayer = new Leaflet.LayerGroup();
  private isHexSelected: boolean = false;
  private HexLocked: string;
  private queryText = '';
  private currentCategory = '';
  private hexContents: HexContents;

  appMapClass: string = 'show-header';
  @HostBinding('class') get Class() {
    return this.appMapClass;
  }

  constructor(private data: HCMapDataService) {}

  ionViewWillLeave() {
    this.map.remove();
  }

  onChangeCategory(c: string) {
    this.currentCategory = c;
  }

  onNewSearch(q: string) {
    this.queryText = q;
  }

  toggleSelectHexagon() {
    this.isHexSelected = !this.isHexSelected;
    if (this.isHexSelected) {
      this.hideSelectHexagon();
    } else {
      this.showSelectHexagon();
    }
  }

  showSelectHexagon() {
    this.isHexSelected = true;
    this.appMapClass = 'show-header';
  }

  hideSelectHexagon() {
    this.isHexSelected = false;
    this.appMapClass = 'hide-header';
  }

  ionViewDidEnter() {
    this.leafletMap();
  }

  leafletMap() {
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 12);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.hexLayer.addTo(this.map);

    this.data.mapData.subscribe(
      // TODO: unsubscribe on component destroy
      ([regions, resources]) => {
        this.hexLayer.clearLayers();
        this.drawRegions(regions);
        this.drawResources(resources);
      }
    );

    // first render
    this.data.setViewport(this.map.getBounds(), this.map.getZoom());

    // recalculate render on drag and zoom
    this.map.on('zoomend dragend', (e: Leaflet.LeafletMouseEvent) => {
      this.data.setViewport(this.map.getBounds(), this.map.getZoom());
    });
  }

  drawResources(resources: HCMapResource[]) {
    resources.forEach(resource => {
      const feature = Leaflet.geoJSON(resource.outline, {
        style: {
          stroke: false,
          fill: true,
          fillColor: '#756bb1',
          fillOpacity: 0.3,
          opacity: 1,
        }
      }).addTo(this.hexLayer);

      // add click events to show data
      feature.on({
        click: (evt) => {
          this.clickEvent(resource.hex);
        }
      });
    });
  }

  clickEvent(hex){
    this.hexContents = this.data.getContentsAtHex(hex);

    if (this.HexLocked !== hex) {
      this.HexLocked = hex;
      this.showSelectHexagon();
    }
    else{
      this.hexContents = undefined;
      this.HexLocked = '';
      this.hideSelectHexagon();
    }
  }

  drawRegions(regions: HCMapRegion[]) {
    regions.forEach(region => {
      if (region.type === 'province') {
        Leaflet.geoJSON(region.boundary, {
          style: {
            stroke: true,
            fill: false,
            weight: 2,
            opacity: 1,
            color: '#fd8d3c'
          }
        }).addTo(this.hexLayer);
      } else if (region.type === 'town') {
        Leaflet.geoJSON(region.boundary, {
          style: {
            stroke: true,
            fill: false,
            weight: 2,
            opacity: 1,
            color: '#2e51ff'
          }
        }).addTo(this.hexLayer);

        Leaflet.geoJSON(region.inside, {
          style: {
            stroke: true,
            fill: false,
            weight: 1,
            opacity: 1,
            color: '#76c0ff'
          }
        }).addTo(this.hexLayer);
      }
    });
  }
}
