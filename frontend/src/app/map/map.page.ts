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

  hexbinZoomBase = 0.8;


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

  updateMarkers() {
    this.markersLayer.clearLayers();
    this.items.forEach(item => {
      let marker = Leaflet.marker({ lat: item.lat, lng: item.lng }, this.markerIcon).addTo(this.markersLayer);
    })
  }

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
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 10);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    // this.map.on("click", (e: Leaflet.LeafletMouseEvent) => {
    //   this.toggleSelectHexagon();
    // });

    // first render
    this.renderDemo();

    // recalculate render on drag and zoom
    this.map.on('zoomend dragend', (e: Leaflet.LeafletMouseEvent) => {
      // this.renderDemo();
    });

  }

  renderDemo(){
    const currentHexList = this.fromBoundsToListHexagonsOfLevel();

    // regions
    this.drawRegions(this.hexbinFilter(currentHexList, regions));

    // resource hexbins
    this.drawHexbins(this.hexbinFilter(currentHexList, resources));
  }

  private findCommonElements(arr1, arr2) {
    return arr1.some(item => arr2.includes(item));
  }

  private addMargin(lat: number, lng: number, coef: number): number[] {
    const new_lat = lat + coef;
    const new_lng = lng + coef / Math.cos(lat * 0.018);
    return [new_lat, new_lng];
  }

  fromBoundsToListHexagonsOfLevel() {
    const bounds = this.map.getBounds();

    const meters = h3.edgeLength(this.hexbinZoom(), 'm');
    // aprox 1km in degree = 1 / 111.32km = 0.0089
    // 1m in degree = 0.0089 / 1000 = 0.0000089
    // pi / 180 = 0.018
    const coef = meters * 1.5 * 0.0000089;

    const northEast = this.addMargin(bounds.getNorth(), bounds.getEast(), coef);
    const southWest = this.addMargin(bounds.getSouth(), bounds.getWest(), -coef);

    const listHex = h3.polyfill([northEast, [northEast[0], southWest[1]], southWest, [southWest[0], northEast[1]]], this.hexbinZoom());

    console.log('current bounds contain ' + listHex.length + ' hexagons of level ' + this.hexbinZoom());
    return listHex;
  }

  drawHexbins(hexbins){
    hexbins.forEach(hexbin => {
      if (hexbin.hex) {
        Leaflet.geoJSON(geojson2h3.h3SetToFeature(hexbin.hex), {
          style: {
            stroke: false,
            fill: true,
            fillOpacity: 0.6,
            opacity: 1,
          }
        }).addTo(this.map);
      }
    });
  }

  drawRegions(hexbins){
    hexbins.forEach(hexbin => {
      if (hexbin.perimeter.length !== 0) {
        Leaflet.geoJSON(geojson2h3.h3SetToFeature(hexbin.perimeter), {
          style: {
            stroke: true,
            fill: false,
            weight: 2,
            opacity: 1,
            color: '#2e51ff'
          }
        }).addTo(this.map);

        Leaflet.geoJSON(geojson2h3.h3SetToMultiPolygonFeature(hexbin.perimeter), {
          style: {
            stroke: true,
            fill: false,
            weight: 1,
            opacity: 1,
            color: '#76c0ff'
          }
        }).addTo(this.map);
      }
    });
  }

  zoomFilter(hexbins) {
    const zoom = this.hexbinZoom();
    const hexbinsNew = [];
    hexbins.forEach(hexbin => {
      if (hexbin.level !== 0 && hexbin.level === zoom) {
        hexbinsNew.push(hexbin);
      }
    });
    return hexbinsNew;
  }

  boxFilter(listHex, hexbins){
    const hexbinsNew = [];
    hexbins.forEach(hexbin => {
      // if (this.findCommonElements(hexbin.perimeter, listHex)) {
        hexbinsNew.push(hexbin);
      // }
      console.log('Painting region ' + hexbin.name);
    });
    return hexbinsNew;
  }

  hexbinFilter(listHex, hexbins){
    const hexbinsZoomFiltred = this.zoomFilter(hexbins);
    console.log('Current bounds contain ' + hexbinsZoomFiltred.length + ' hexagons');
    const hexbinsBoxFiltred = this.boxFilter(listHex, hexbinsZoomFiltred);
    console.log('Current bounds contain ' + hexbinsBoxFiltred.length + ' hexagons');
    return hexbinsBoxFiltred;
  }

  hexbinZoom() {
    const zoom = this.map.getZoom();
    return zoom * this.hexbinZoomBase;
  }

}
