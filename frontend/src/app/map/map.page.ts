import { Component, OnInit, HostBinding } from '@angular/core';
import { DataService } from '../services/data.service';
import { Item } from '../interfaces/item';
import * as geojson2h3 from 'geojson2h3';

import * as Leaflet from 'leaflet';

import resources from '../../assets/data/resources.json';
import regions from '../../assets/data/regions.json';
console.log('resources' , resources);
console.log('regions' , regions);

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


    const temp = ["87344cd04ffffff", "87344cd23ffffff", "87344cd21ffffff", "873441308ffffff", "87344130bffffff", "873441225ffffff", "873441221ffffff", "873441223ffffff", "873441220ffffff", "873441224ffffff", "87344130affffff", "87344130effffff", "87344131dffffff", "873441319ffffff", "873441226ffffff", "87344131bffffff", "873441318ffffff", "87344131affffff","87344cd01ffffff", "87344cd03ffffff", "87344cd00ffffff", "87344cd02ffffff", "87344cd13ffffff", "87344cd12ffffff", "87344cda5ffffff", "873441a4bffffff", "87344cd16ffffff", "87344cd10ffffff", "873441a49ffffff", "87344cd14ffffff", "87344cd15ffffff", "87344cd32ffffff", "87344cd33ffffff", "87344cd06ffffff", "87344cd36ffffff", "87344cd30ffffff", "87344cd31ffffff", "87344cd22ffffff", "87344cd35ffffff", "87344cd34ffffff", "873441a69ffffff", "87346a69affffff", "87346a69bffffff", "87344cd26ffffff", "87344cd20ffffff", "87344cd25ffffff", "87344cd24ffffff", "87346a699ffffff", "87346a698ffffff", "87346a69dffffff", "87346a68affffff", "87346a68bffffff", "87346a688ffffff", "87346a68effffff", "87346a683ffffff", "87346a68cffffff","87344cd9affffff", "87344cd9bffffff", "87344cd99ffffff", "87344cd9dffffff", "873441369ffffff", "87344ccb4ffffff", "87344ccb5ffffff", "87344cca6ffffff", "87344cd8affffff", "87344cd8effffff", "87344cd83ffffff", "87344cd82ffffff", "87344136bffffff", "87344ccb6ffffff", "87344ccb0ffffff", "87344ccb1ffffff", "87344cca2ffffff", "87344cd88ffffff", "87344cd8cffffff", "87344cd81ffffff", "87344cd80ffffff", "87344cd86ffffff", "87344134cffffff", "87344134dffffff", "87344ccb2ffffff", "87344ccb3ffffff", "87344cdaaffffff", "87344cd85ffffff", "87344cd84ffffff", "873441348ffffff", "873441349ffffff", "87344cc94ffffff", "87344cdaeffffff", "87344cda3ffffff", "87344134bffffff", "87344cc96ffffff", "87344cc90ffffff", "87344cd91ffffff", "87344cd90ffffff", "87344cd93ffffff", "87344cd9effffff", "87344cd9cffffff", "87344cd95ffffff", "87344cd94ffffff", "87344cd96ffffff", "87344cd98ffffff", "87344cdb3ffffff", "87344cd92ffffff", "87344136dffffff", "873441361ffffff", "87344136cffffff", "873441365ffffff", "873441364ffffff", "87344ccabffffff", "87344ccaaffffff", "87344cc8cffffff", "87344cc8dffffff", "87344ccf6ffffff", "87344cca9ffffff", "87344cca8ffffff", "87344ccaeffffff", "87344cc85ffffff", "87344cc81ffffff", "87344cc8effffff", "87344cc88ffffff", "87344cc89ffffff", "87344ccf2ffffff", "87344ccf0ffffff", "87344ccf4ffffff", "87344cc1affffff", "87344ccadffffff", "87344ccacffffff", "87344cca1ffffff", "87344cca3ffffff", "87344cc84ffffff", "87344cc80ffffff", "87344ccd4ffffff", "87344ccf3ffffff", "87344ccf1ffffff", "87344ccf5ffffff", "87344cc1bffffff", "87344cca0ffffff", "87344cc86ffffff", "87344ccd5ffffff", "873441345ffffff", "873441344ffffff", "873441340ffffff", "873441341ffffff", "87344136affffff", "87344136effffff", "873441363ffffff", "873441362ffffff", "873441371ffffff", "873441346ffffff", "873441343ffffff", "87344134effffff", "873441368ffffff", "873441360ffffff", "873441366ffffff", "873441375ffffff", "87344cc13ffffff", "87344cc12ffffff", "87344cc1effffff", "87344cc11ffffff", "87344cc10ffffff", "87344cca5ffffff", "87344cc18ffffff", "87344cc1cffffff", "87344cca4ffffff", "87344126dffffff", "873441268ffffff", "873441269ffffff", "87344cc9affffff", "87344cc9effffff", "87344cc93ffffff", "87344126bffffff", "87344c534ffffff", "87344cc91ffffff", "87344cc33ffffff", "87344cc32ffffff", "87344cc14ffffff", "87344cc15ffffff", "87344cc06ffffff", "87344cc31ffffff", "87344cc30ffffff", "87344cc36ffffff", "87344cd8dffffff", "87344cd89ffffff", "87344cc16ffffff", "87344cc02ffffff", "87344cc00ffffff", "87344cc04ffffff", "87344cc22ffffff", "87344cc35ffffff", "87344cd8bffffff", "873441275ffffff", "873441274ffffff", "873441270ffffff", "873441271ffffff", "873441262ffffff", "873441266ffffff", "87344135bffffff", "87344135affffff", "873441229ffffff", "873441276ffffff", "873441272ffffff", "873441273ffffff", "873441246ffffff", "873441244ffffff", "873441260ffffff", "873441264ffffff", "873441359ffffff", "873441358ffffff", "87344122bffffff", "87344120dffffff", "873441255ffffff", "873441265ffffff", "87344134affffff", "87344135dffffff", "87344cdb1ffffff", "87344cda2ffffff", "87344c524ffffff", "87344cc99ffffff", "87344c526ffffff", "87344c520ffffff", "87344c525ffffff", "87344cc8bffffff", "87344cc8affffff", "87344cc9dffffff", "87344cc98ffffff", "87344cc9bffffff", "87344c522ffffff", "87344c523ffffff", "87344c521ffffff", "87344ccd2ffffff", "87344ccd6ffffff", "87344cc83ffffff", "87344cc9cffffff", "87344c504ffffff", "87344c505ffffff", "87344c52effffff", "87344c52cffffff", "87344ccd3ffffff", "87344ccd0ffffff", "87344cc82ffffff", "87344c500ffffff", "87344c52affffff", "87344c528ffffff", "87344cc95ffffff", "873441355ffffff", "873441342ffffff", "873441373ffffff", "873441370ffffff", "87344130dffffff", "87344cda9ffffff", "87344cc34ffffff", "87344cda8ffffff", "87344cdabffffff", "87344cc26ffffff", "873441241ffffff", "873441240ffffff", "873441243ffffff", "87344124effffff", "87344124cffffff", "87344126affffff", "873441245ffffff", "873441242ffffff", "87344125dffffff", "87344124affffff", "873441248ffffff", "87344126effffff", "873441263ffffff", "87344126cffffff", "873441261ffffff", "87344cc92ffffff", "87344cda1ffffff", "87344cda0ffffff", "87344cdacffffff", "873441354ffffff", "873441309ffffff", "873441356ffffff", "873441350ffffff", "873441372ffffff", "873441351ffffff", "87344135effffff", "873441353ffffff", "87344122dffffff", "87344135cffffff", "873441352ffffff", "87344122cffffff", "873441228ffffff", "87344122effffff", "87344122affffff", "87344c531ffffff", "87344c530ffffff", "87344c506ffffff", "87344c535ffffff", "87344c502ffffff", "87344cd18ffffff", "87344cd1effffff", "87344cd1affffff", "87344cd1bffffff", "87344cd19ffffff", "87344cd1dffffff", "87344cd1cffffff", "87344cd11ffffff", "87344cdadffffff", "87344c516ffffff", "87344124bffffff", "87344c512ffffff", "87344c510ffffff", "87344c514ffffff", "873441249ffffff", "87344c5acffffff", "87344c513ffffff", "87344c511ffffff", "87344c515ffffff", "87344c533ffffff", "87344c532ffffff", "87344124dffffff", "87344c51cffffff", "87344c536ffffff","87344cd05ffffff", "87344cd2effffff", "87344cd2cffffff", "87346a6d2ffffff", "87346a6d6ffffff", "87346a689ffffff", "87346a68dffffff", "87346a6abffffff", "87346a6f6ffffff", "87346a6d4ffffff", "87346a6c6ffffff", "87346a6f1ffffff", "87346a6f4ffffff", "87346a619ffffff", "87346a6e6ffffff", "87346a6e2ffffff", "87346a6e0ffffff", "87346a6e4ffffff", "87346a61bffffff", "87346a6f5ffffff", "87346a6f0ffffff", "87346a6f2ffffff", "87346a6f3ffffff", "87346a6d5ffffff", "87346a6d0ffffff", "87346a6d3ffffff", "87344cd2affffff"];
    const allHexCanarias = [...new Set(temp)];

    Leaflet.geoJSON(geojson2h3.h3SetToFeature(allHexCanarias), { style: {
        stroke: true,
        fill: false,
        weight: 5,
        opacity: 1,
        color: '#0000ff'
      }
    }).addTo(this.map);
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
