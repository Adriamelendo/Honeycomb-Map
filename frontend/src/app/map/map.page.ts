import { Component, OnInit } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { DataService, Message } from '../services/data.service';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  map: Leaflet.Map;
  isHexSelected: boolean = false;

  howSearchbar: boolean;
  queryText = '';
  segment = 'all';
  currentMargin = 0;
  bigLatLng;
  bigZoom;

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

  constructor(
    public modalCtrl: ModalController,
    public routerOutlet: IonRouterOutlet,
    private data: DataService
  ) { }

  ngOnInit() {
  }

  // async createModelWithReturn() {
  //   const modal = await this.modalCtrl.create({
  //     component:  YourComponent ,
  //     swipeToClose: true,
  //     mode: 'ios', //to show as stack over
  //     presentingElement: this.routerOutlet.nativeEl,
  //     componentProps: { excludedTracks: this.excludeTracks }
  //   });
  //   await modal.present();

  //   const { data } = await modal.onWillDismiss();
  //   if (data) {
  //     this.excludeTracks = data;
  //     // this.updateWhatever();
  //   }
  // }

  updateFilter() {

  }

  toggleSelectHexagon() {    
    this.isHexSelected = !this.isHexSelected;    
  }

  ionViewDidEnter() {
    this.leafletMap();
  }

  leafletMap() {
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 10);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    this.map.on("click", e => {
      console.log(e.latlng); // get the coordinates
      if (this.isHexSelected) {
        this.map.flyTo(this.bigLatLng, this.bigZoom, { animate: true, duration: 0.8 });
      } else {
        Leaflet.marker(e.latlng, this.markerIcon).addTo(this.map); // add the marker onclick
        this.bigLatLng = this.map.getCenter()
        this.bigZoom = this.map.getZoom();
        this.map.flyTo(e.latlng, 12, { animate: true, duration: 0.8 });
      }
      this.toggleSelectHexagon();
    });
  }

  ionViewWillLeave() {
    this.map.remove();
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

}
