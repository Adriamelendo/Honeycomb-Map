import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {environment} from '../environments/environment';

// Use parse with typescript
import * as Parse from 'parse';
// To set the server URL
let parse = require('parse');


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    //Parse init
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY);
    parse.serverURL = environment.serverURL;
    
    
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

 

  // getClosestUser() {
  //   let geoPoint = new Parse.GeoPoint(this.geoposition.coords.latitude, this.geoposition.coords.longitude);
  //   let query = new Parse.Query(Parse.User);
  //   query.near('Location', geoPoint);
  //   query.limit(1);

  //   query.find().then(users => {
  //     let user = users[0];
  //     console.log('Closest user', user);

  //     let current:Marker = {
  //       lat: user.get('Location').latitude,
  //       lng: user.get('Location').longitude,
  //       label: user.get('name')
  //     };

  //     let me:Marker = {
  //       lat: this.geoposition.coords.latitude,
  //       lng: this.geoposition.coords.longitude,
  //       label: 'Me'
  //     };

  //     this.navCtrl.push('MapsPage', {data: {current, markers: [me, current]}});
  //   }, err => {
  //     console.log('Error getting closest user', err)
  //   })
  // }

  // getAllStores() {
  //   let query = new Parse.Query('Store');

  //   query.find().then(stores => {
  //     console.log('Stores', stores);

  //     let markers = stores.map(s => {
  //       return {
  //         lat: s.get('Location').latitude,
  //         lng: s.get('Location').longitude,
  //         label: s.get('name')
  //       };
  //     });

  //     this.navCtrl.push('MapsPage', {data: {current: markers[0], markers}});
  //   }, err => {
  //     console.log('Error getting closest user', err)
  //   })
  // }

  // getClosestStore() {
  //   let geoPoint = new Parse.GeoPoint(this.geoposition.coords.latitude, this.geoposition.coords.longitude);
  //   let query = new Parse.Query('Store');
  //   query.near('Location', geoPoint);
  //   query.limit(1);

  //   query.find().then(stores => {
  //     let store = stores[0];
  //     console.log('Closest user', store);

  //     let current:Marker = {
  //       lat: store.get('Location').latitude,
  //       lng: store.get('Location').longitude,
  //       label: store.get('name')
  //     };

  //     let me:Marker = {
  //       lat: this.geoposition.coords.latitude,
  //       lng: this.geoposition.coords.longitude,
  //       label: 'Me'
  //     };

  //     this.navCtrl.push('MapsPage', {data: {current, markers: [me, current]}});
  //   }, err => {
  //     console.log('Error getting closest user', err)
  //   })
  // }

}
