import { Component, OnInit, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import { Item } from '../interfaces/item';
import * as geojson2h3 from 'geojson2h3';

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
    this.data.getItems().subscribe((resp=>{
      this.items=resp;
      this.updateMarkers();
    }));
    this.data.queryAllItems();
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
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 6);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on("click", (e: Leaflet.LeafletMouseEvent) => {
      console.log(e.latlng); // get the coordinates
      // this.centerClickPoint(e.latlng);
      this.toggleSelectHexagon();
    });

    this.drawAllRegionsOfLevel(6);

  }

  drawAllRegionsOfLevel(lev:number){
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
  centerClickPoint(latlng: Leaflet.LatLng ){
      if (this.isHexSelected) {
        this.map.flyTo(this.bigLatLng, this.bigZoom, { animate: true, duration: 0.8 });
      } else {
        // Leaflet.marker(latlng, this.markerIcon).addTo(this.map); // add the marker onclick
        this.bigLatLng = this.map.getCenter()
        this.bigZoom = this.map.getZoom();
        this.map.flyTo(latlng, 12, { animate: true, duration: 0.8 });
      }
    }

  zoomFilter(hexbinsOld){
    const zoom = this.hexbinZoom();
    const hexbinsNew = [];

    hexbinsOld.forEach(element => {
      if (element.level !== 0 && element.level === zoom){
        hexbinsNew.push(element);
      }
    });
    return hexbinsNew;
  }

  hexbinZoom(){
    const zoom = this.map.getZoom();
    return zoom * this.hexbinZoomBase;
  }

  updateMarkers() {
    this.markersLayer.clearLayers();
    this.items.forEach(item=>{
      let marker = Leaflet.marker({lat:item.lat, lng: item.lng}, this.markerIcon).addTo(this.markersLayer);
    })
  }

  ionViewWillLeave() {
    this.map.remove();
  }
}
