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
import * as geojson2h3 from 'geojson2h3';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  private map: Leaflet.Map;

  private hexLayer = new Leaflet.LayerGroup();
  private clickedHex = new Leaflet.LayerGroup();
  private hoverHex = new Leaflet.LayerGroup();
  private hexLocked: string;
  private searchText = '';
  private currentCategory = '';
  private hexContents: HexContents;
  private currentHexLevel: number;
  disableHover:boolean=false;

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
    // España 
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 6);
    // Madrid 
    // this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 12);
    // Carrión de Calatrava
    // this.map = new Leaflet.Map('mapId').setView([39.018932, -3.8261683], 12);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);
    this.currentHexLevel = this.data.getHexLevel(this.map.getZoom())
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
    this.map.on('dragend', (e: Leaflet.LeafletMouseEvent) => {
      this.calculateData();
    });
    this.map.on('zoomend', (e: Leaflet.LeafletMouseEvent) => {
      const nextLevel = this.data.getHexLevel(this.map.getZoom());
      if (nextLevel !== this.currentHexLevel) {
        this.currentHexLevel = nextLevel;
        this.hexContents = undefined;
        this.hexLocked = '';
        this.hideSelectHexagon();
        this.clickedHex.clearLayers();
        this.hoverHex.clearLayers();
        this.disableHover=false;
      }
      this.calculateData();
    });
  }

  private calculateData() {
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
        }
      }).addTo(this.hexLayer);

      // add mouseover events to show data
      feature.on({
        mouseover: (evt) => {
          if (!this.disableHover) {
            this.hexHover(resource.hex);
          }
        }, click: (evt) => {
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
            opacity: 1,
            color: '#fd8d3c',
            weight: 2,
            fill: true,
            fillColor: '#fd8d3c',
            fillOpacity: (region.resources.length > 0) ? 0.1 : 0,
          }
        }).addTo(this.hexLayer);

        // add mouseover events to show data
        feature.on({
          mouseover: (evt) => {
            if (!this.disableHover) {
              const level = this.data.getHexLevel(this.map.getZoom());
              const hex = h3.geoToH3(evt.latlng.lat, evt.latlng.lng, level);
              this.hexHover(hex);
            }
          }, click: (evt) => {
            const level = this.data.getHexLevel(this.map.getZoom());
            const hex = h3.geoToH3(evt.latlng.lat, evt.latlng.lng, level);
            this.hexClicked(hex);
          }
        });
      } else if (region.type === 'town') {
        Leaflet.geoJSON(region.boundary, {
          style: {
            stroke: true,
            color: '#2e51ff',
            opacity: 1,
            weight: 2,
            fill: true,
            fillColor: '#2e51ff',
            fillOpacity: (region.resources.length > 0) ? 0.1 : 0,
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
    this.clickedHex.clearLayers();
    if (this.hexLocked !== hex) {
      this.hexLocked = hex;      
      this.showSelectHexagon();
      const geo = geojson2h3.h3ToFeature(hex);
      this.clickedHex = Leaflet.geoJSON(geo, {
        style: {
          stroke: true,
          fill: false,
          color: '#b1393d',
          opacity: 1,
        }
      }).addTo(this.map);
      this.centerMapOnHex(hex);
    }
    else {
      this.hexContents = undefined;
      this.hexLocked = '';
      this.hideSelectHexagon();
      this.disableHover = false;
    }
  }

  private hexHover(hex) {
    const geo = geojson2h3.h3ToFeature(hex);
    this.hoverHex.clearLayers();
    this.hoverHex = Leaflet.geoJSON(geo, {
      style: {
        stroke: true,
        fill: true,
        fillColor: '#b1393d',
        color: '#b1393d',
        fillOpacity: 0.8,
        opacity: 1,
      }
    }).addTo(this.map);
    this.hoverHex.on({
      click: (evt) => {
        this.disableHover = true;
        this.hoverHex.clearLayers();
        this.hexClicked(hex);
      }
    });
  }

  private centerMapOnHex(hex: string) {
    // current center if we want to save
    //this.bigLatLng = this.map.getCenter();
    this.map.flyTo(h3.h3ToGeo(hex) as Leaflet.LatLngExpression, this.map.getZoom(), { animate: true, duration: 0.8 });
  }

  private showSelectHexagon() {
    this.appMapClass = 'hide-header';
  }

  private hideSelectHexagon() {
    this.appMapClass = 'show-header';
  }
}
