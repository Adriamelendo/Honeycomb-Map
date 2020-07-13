import { Component, OnInit, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import { Item } from '../interfaces/item';
import * as geojson2h3 from 'geojson2h3';
import * as h3 from 'h3-js';

import * as Leaflet from 'leaflet';

import resources from '../../assets/data/resources.json';
import regions from '../../assets/data/regions.json';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map: Leaflet.Map;
  markersLayer = new Leaflet.LayerGroup();
  isHexSelected: boolean = false;
  queryText = '';
  currentCategory = '';
  items: Item[] = [];

  hexbinZoomBase = 1;


  bigLatLng: Leaflet.LatLng;
  bigZoom: number;

  // excludeTracks: any = [];
  markerIcon = {
    icon: Leaflet.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      // specify the path here
      iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png"
    })
  };

  appMapClass: string = 'show-header';
  @HostBinding('class') get Class() {
    return this.appMapClass;
  }


  constructor(private data: DataService) { }

  ngOnInit() {
    // this.data.getItems().subscribe((resp=>{
    //   this.items=resp;
    //   this.updateMarkers();
    // }));
    // this.data.queryAllItems();
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
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 7);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on("click", (e: Leaflet.LeafletMouseEvent) => {
      console.log(e.latlng); // get the coordinates
      // this.centerClickPoint(e.latlng);
      this.toggleSelectHexagon();
    });

    // level defined by map zoom
    // this.drawAllRegionsOfLevel();

   
    // const currentHexList = this.fromBoundsToListHexagonsOfLevel(this.hexbinZoom());
    // this.drawInsideRegionsOfLevel(currentHexList);

  }

  private findCommonElements(arr1, arr2) {
    return arr1.some(item => arr2.includes(item))
  }

  private addMargin(lat: number, lng: number, coef: number): number[] {
    const new_lat = lat + coef;
    const new_lng = lng + coef / Math.cos(lat * 0.018);
    return [new_lat, new_lng]
  }

  fromBoundsToListHexagonsOfLevel(lev: number) {
    const bounds = this.map.getBounds();

    const meters = h3.edgeLength(lev, 'm');
    // aprox 1km in degree = 1 / 111.32km = 0.0089
    // 1m in degree = 0.0089 / 1000 = 0.0000089
    // pi / 180 = 0.018
    const coef = meters * 1.5 * 0.0000089;

    const northEast = this.addMargin(bounds.getNorth(), bounds.getEast(), coef);
    const southWest = this.addMargin(bounds.getSouth(), bounds.getWest(), -coef);

    const listHex = h3.polyfill([northEast, [northEast[0], southWest[1]], southWest, [southWest[0], northEast[1]]], lev);

    console.log('current bounds contain ' + listHex.length + ' hexagons of level ' + lev);
    return listHex;
  }

  drawInsideRegionsOfLevel( listHex: string[]) {
    const regionsFiltred = this.zoomFilter(regions);
    regionsFiltred.forEach(region => {
      if (region.perimeter.length != 0) {
        if (this.findCommonElements(listHex, region.perimeter)) {
          console.log('painting region ' + region.name);
          Leaflet.geoJSON(geojson2h3.h3SetToFeature(region.perimeter), {
            style: {
              stroke: true,
              fill: false,
              weight: 5,
              opacity: 1,
              color: '#0000ff'
            }
          }).addTo(this.map);
        }

      }
    });
  }
  drawAllRegionsOfLevel() {
    const regionsFiltred = this.zoomFilter(regions);
    regionsFiltred.forEach(region => {
      if (region.perimeter.length !== 0) {
        Leaflet.geoJSON(geojson2h3.h3SetToFeature(region.perimeter), {
          style: {
            stroke: true,
            fill: false,
            weight: 5,
            opacity: 1,
            color: '#0000ff'
          }
        }).addTo(this.map);
      }

    });
  }
  centerClickPoint(latlng: Leaflet.LatLng) {
    if (this.isHexSelected) {
      this.map.flyTo(this.bigLatLng, this.bigZoom, { animate: true, duration: 0.8 });
    } else {
      // Leaflet.marker(latlng, this.markerIcon).addTo(this.map); // add the marker onclick
      this.bigLatLng = this.map.getCenter()
      this.bigZoom = this.map.getZoom();
      this.map.flyTo(latlng, 12, { animate: true, duration: 0.8 });
    }
  }

  zoomFilter(hexbinsOld) {
    const zoom = this.hexbinZoom();
    const hexbinsNew = [];

    hexbinsOld.forEach(element => {
      if (element.level !== 0 && element.level === zoom) {
        hexbinsNew.push(element);
      }
    });
    return hexbinsNew;
  }

  hexbinZoom() {
    const zoom = this.map.getZoom();
    return zoom * this.hexbinZoomBase;
  }

  updateMarkers() {
    this.markersLayer.clearLayers();
    this.items.forEach(item => {
      let marker = Leaflet.marker({ lat: item.lat, lng: item.lng }, this.markerIcon).addTo(this.markersLayer);
    })
  }

  ionViewWillLeave() {
    this.map.remove();
  }
}
