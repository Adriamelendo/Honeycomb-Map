import { Component, OnInit, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import { Item } from '../interfaces/item';

import * as Leaflet from 'leaflet';

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
    this.currentCategory=c;
  }

  onNewSearch(q: string) {
    this.queryText=q;
  }

  toggleSelectHexagon() {    
    this.isHexSelected = !this.isHexSelected;
    if(this.isHexSelected) {
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

    this.map.on("click", (e:Leaflet.LeafletMouseEvent) => {
      console.log(e.latlng); // get the coordinates
      if (this.isHexSelected) {
        this.map.flyTo(this.bigLatLng, this.bigZoom, { animate: true, duration: 0.8 });
      } else {
        // Leaflet.marker(e.latlng, this.markerIcon).addTo(this.map); // add the marker onclick
        this.bigLatLng = this.map.getCenter()
        this.bigZoom = this.map.getZoom();
        this.map.flyTo(e.latlng, 12, { animate: true, duration: 0.8 });
      }
      this.toggleSelectHexagon();
    });
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
