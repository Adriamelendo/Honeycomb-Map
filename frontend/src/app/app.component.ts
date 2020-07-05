import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

// Use parse with typescript
import * as Parse from 'parse';
import { DataService } from './services/data.service';
// To set the server URL
let parse = require('parse');


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  signedIn = false;  
  geoposition: Geoposition;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService:  AuthService,
    private geolocation: Geolocation,
    private data: DataService
  ) {
    this.initializeApp();
    //Parse init
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY);
    parse.serverURL = environment.serverURL;
    // to save user data inside the browser in a safe way
    // Parse.enableEncryptedUser();
    // Parse.secret = 'my Secrey Key';

    //to start always signOut
    this.signOut();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.authService.isSignedIn().subscribe((resp=>{
      this.signedIn=resp;
    }));    
  }

  signOut() {
    this.authService.signOut();
  }

  getMyLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log('Current Position', resp.coords);
      this.geoposition = resp;
      this.data.setUserPosition(this.geoposition.coords.latitude,this.geoposition.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}
