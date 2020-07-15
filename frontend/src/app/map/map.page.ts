import { Component, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import { HCMapDataService, HCMapRegion, HCMapResource } from '../services/hcmap-data.service';
import { Item } from '../interfaces/item';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  map: Leaflet.Map;
  /* markersLayer = new Leaflet.LayerGroup(); */

  hexLayer = new Leaflet.LayerGroup();
  isHexSelected: boolean = false;
  queryText = '';
  currentCategory = '';
  items: Item[] = [];

  /* // excludeTracks: any = []; */
  /* markerIcon = { */
  /*   icon: Leaflet.icon({ */
  /*     iconSize: [25, 41], */
  /*     iconAnchor: [10, 41], */
  /*     popupAnchor: [2, -40], */
  /*     // specify the path here */
  /*     iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png", */
  /*     shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png" */
  /*   }) */
  /* }; */

  appMapClass: string = 'show-header';
  @HostBinding('class') get Class() {
    return this.appMapClass;
  }

  /* constructor(private data: DataService) { } */
  constructor(private data: HCMapDataService) {}

  /* updateMarkers() { */
  /*   this.markersLayer.clearLayers(); */
  /*   this.items.forEach(item => { */
  /*     let marker = Leaflet.marker({ lat: item.lat, lng: item.lng }, this.markerIcon).addTo(this.markersLayer); */
  /*   }) */
  /* } */

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
      this.appMapClass = 'hide-header';
    } else {
      this.appMapClass = 'show-header';
    }
  }

  ionViewDidEnter() {
    this.leafletMap();
  }

  leafletMap() {
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 12);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    /* this.markersLayer.addTo(this.map); */
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
    /* this.renderDemo(); */
    this.data.setViewport(this.map.getBounds(), this.map.getZoom());

    // recalculate render on drag and zoom
    this.map.on('zoomend dragend', (e: Leaflet.LeafletMouseEvent) => {
      /* this.renderDemo(); */
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

      // add hover effect to show data
      feature.on({
        mouseover: (evt) => {
          this.items = this.data.getResourcesInHex(resource.hex);
          this.toggleSelectHexagon();
        }, mouseout: (evt) => {
          this.items = [];
          this.toggleSelectHexagon();
        }
      });
    });
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
