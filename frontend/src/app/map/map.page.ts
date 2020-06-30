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
  isHexSelected:boolean=false;

  howSearchbar: boolean;
  queryText = '';
  segment = 'all';
  currentMargin = 0;
  // excludeTracks: any = [];


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
    //ADRIA: temporal thing, the following must be executed when click on hexagon
    this.isHexSelected=!this.isHexSelected;

    /*
    //do it only before @media (min-width: 680px)
    if(this.isHexSelected) {
      //350 must be half oh map height
      //to setView set to the center of the space
      //if change this we must change .open-panel
      this.currentMargin = -350;
    } else {
      this.currentMargin = 0;
    }
    */
  }

  ionViewDidEnter() {
    this.leafletMap();    
  }

  leafletMap() {
    this.map = new Leaflet.Map('mapId').setView([40.428122, -3.696058], 10);

    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // const markPoint = Leaflet.marker([12.972442, 77.594563]);
    // markPoint.bindPopup('<p>Tashi Delek - Bangalore.</p>');
    // this.map.addLayer(markPoint);
  }

  ionViewWillLeave() {
    this.map.remove();
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

}
