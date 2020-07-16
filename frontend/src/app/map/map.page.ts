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
import * as h3 from 'h3-js';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  private map: Leaflet.Map;

  private hexLayer = new Leaflet.LayerGroup();
  private hexLocked: string;
  private searchText = '';
  private currentCategory = '';
  private hexContents: HexContents;

  appMapClass: string = 'show-header';
  @HostBinding('class') get Class() {
    return this.appMapClass;
  }

  constructor(private data: HCMapDataService) { }

  ionViewDidEnter() {
    this.addMap();
  }

  ionViewWillLeave() {
    this.map.remove();
  }

  onChangeCategory(c: string) {
    this.currentCategory = c;
    this.calculateData();
  }

  onNewSearch(q: string) {
    this.searchText = q;
    this.calculateData();
  }

  private addMap() {
    // Madrid 
    // this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 12);

    // Carrión de Calatrava
    this.map = new Leaflet.Map('mapId').setView([39.018932, -3.8261683], 12);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.hexLayer.addTo(this.map);

    this.data.mapData.subscribe(
      // TODO: unsubscribe on component destroy
      ([regions, resources]) => {
        if (regions && resources) {
          this.hexLayer.clearLayers();
          this.drawRegions(regions);
          this.drawResources(resources);
        }
      }
    );

    // first render
    this.calculateData();

    // recalculate render on drag and zoom
    this.map.on('zoomend dragend', (e: Leaflet.LeafletMouseEvent) => {
      this.calculateData();
    });
  }

  private calculateData() {
    this.hexContents = undefined;
    this.hexLocked = '';
    this.hideSelectHexagon();
    this.data.setViewport(
      this.map.getBounds(),
      this.map.getZoom(),
      this.currentCategory,
      this.searchText,
    );
  }

  private drawResources(resources: HCMapResource[]) {
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
          this.hexClicked(resource.hex);
        }
      });
    });
  }

  private drawRegions(regions: HCMapRegion[]) {
    regions.forEach(region => {
      if (region.type === 'province') {
        const feature = Leaflet.geoJSON(region.boundary, {
          style: {
            stroke: true,
            fill: true,
            weight: 2,
            fillOpacity: 0,
            opacity: 1,
            color: '#fd8d3c'
          }
        }).addTo(this.hexLayer);

        // add click events to show data
        feature.on({
          click: (evt) => {
            const level = this.data.getHexLevel(this.map.getZoom());
            const hex = h3.geoToH3(evt.latlng.lat, evt.latlng.lng, level);
            this.hexClicked(hex);
          }
        });

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

  private hexClicked(hex) {
    this.hexContents = this.data.getContentsAtHex(hex);

    if (this.hexLocked !== hex) {
      this.hexLocked = hex;
      this.showSelectHexagon();
    }
    else {
      this.hexContents = undefined;
      this.hexLocked = '';
      this.hideSelectHexagon();
    }
  }

  private showSelectHexagon() {
    this.appMapClass = 'show-header';
  }

  private hideSelectHexagon() {
    this.appMapClass = 'hide-header';
  }
}
