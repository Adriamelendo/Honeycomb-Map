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
  hexLayer: Leaflet.LayerGroup[] = [];
  isHexSelected: boolean = false;
  queryText = '';
  currentCategory = '';
  items: Item[] = [];

  hexbinZoomBase = 0.8;

  viewHexList = [];
  searchHexList = [];

  resourcesByHex: Map<string, object>;

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

    this.resourcesByHex = resources.reduce(
      (map, resource) => {
        if (!map[resource.hex]) {
          map[resource.hex] = [];
        }
        map[resource.hex].push(resource);
        return map;
      },
      new Map<string, object>()
    );
    //console.log(this.resourcesByHex);
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
      this.renderDemo();
    });

  }

  renderDemo() {
    console.log('Map zoom: ', this.map.getZoom());
    console.log('Hex zoom: ', this.hexbinZoom());

    this.viewHexList = this.fromBoundsToListHexagonsOfLevel(this.hexbinZoom());
    this.searchHexList = this.fromBoundsToListHexagonsOfLevel(this.hexbinZoom() - 2);

    const listRegions = this.boxFilter(this.searchHexList, regions[this.hexbinZoom()-2] || [] );

    console.log('listRegions: ', listRegions);
    // regions
    const regionsToDraw=this.regionsInList(listRegions, regions[this.hexbinZoom()]);
    console.log('regionsToDraw: ', regionsToDraw);
    this.drawRegions(regionsToDraw);
    // resource hexbins
    //this.drawHexbins(this.hexbinFilter(currentHexList, resources));
  }

  regionsInList(listNames:string[], hexbins: any[]) {
    const hexbinsNew = [];   
    hexbins.forEach(hexbin => {      
        if (listNames.indexOf(hexbin.name) != -1 ) {
          hexbinsNew.push(hexbin);
        }     
      //console.log('Painting region ' + hexbin.name);
    });
    return hexbinsNew;
  }

  private findCommonElements(arr1, arr2) {
    return arr1.some(item => arr2.includes(item));
  }

  private addMargin(lat: number, lng: number, coef: number): number[] {
    const new_lat = lat + coef;
    const new_lng = lng + coef / Math.cos(lat * 0.018);
    return [new_lat, new_lng];
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

    console.log('level = ' + lev + '; //are ' + listHex.length + ' hexagons');
    return listHex;
  }

  drawHexbins(hexbins) {
    hexbins.forEach(hexbin => {
      if (hexbin.hex) {
        const resource = Leaflet.geoJSON(geojson2h3.h3ToFeature(hexbin.hex), {
          style: {
            stroke: false,
            fill: true,
            fillColor: '#756bb1',
            fillOpacity: 0.6,
            opacity: 1,
          }
        }).addTo(this.map);
        resource.on({
          mouseover: (evt) => {
            const resources = this.resourcesByHex[hexbin.hex];
            if (resources) {
              resources.forEach((res) => console.log(res.title));
            }
          },
        });
      }
    });
  }

  drawRegions(hexbins) {
    const lev = this.hexbinZoom();
    if (!this.hexLayer[lev]) {
      this.hexLayer[lev] = new Leaflet.LayerGroup();
      hexbins.forEach(hexbin => {
        if (hexbin && hexbin.perimeter && hexbin.perimeter.length !== 0) {
          if (hexbin.type === 'province') {
            Leaflet.geoJSON(geojson2h3.h3SetToFeature(hexbin.perimeter), {
              style: {
                stroke: true,
                fill: false,
                weight: 2,
                opacity: 1,
                color: '#fd8d3c'
              }
            }).addTo(this.hexLayer[lev]);
          } else if (hexbin.type === 'town') {
            Leaflet.geoJSON(geojson2h3.h3SetToFeature(hexbin.perimeter), {
              style: {
                stroke: true,
                fill: false,
                weight: 2,
                opacity: 1,
                color: '#2e51ff'
              }
            }).addTo(this.hexLayer[lev]);

            Leaflet.geoJSON(geojson2h3.h3SetToMultiPolygonFeature(hexbin.perimeter), {
              style: {
                stroke: true,
                fill: false,
                weight: 1,
                opacity: 1,
                color: '#76c0ff'
              }
            }).addTo(this.hexLayer[lev]);
          }
        }
      });
    }

    this.hexLayer.forEach(aux => {
      aux.removeFrom(this.map);
    });
    this.hexLayer[lev].addTo(this.map);

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

  boxFilter(listHex, hexbins): string[] {
    const hexbinsNew = [];
    console.log(hexbins);
    hexbins.forEach(hexbin => {      
        if (this.findCommonElements(hexbin.perimeter, listHex)) {
          hexbinsNew.push(hexbin.name);
        }     
      //console.log('Painting region ' + hexbin.name);
    });
    return hexbinsNew;
  }

  // hexbinFilter(listHex, hexbins) {
  //   const hexbinsZoomFiltred = this.zoomFilter(hexbins);
  //   console.log('Current bounds contain ' + hexbinsZoomFiltred.length + ' hexbinsZoomFiltred');
  //   const hexbinsBoxFiltred = this.boxFilter(listHex, hexbinsZoomFiltred);
  //   console.log('Current bounds contain ' + hexbinsBoxFiltred.length + ' hexbinsBoxFiltred');
  //   return hexbinsBoxFiltred;
  // }

  hexbinZoom() {
    const zoom = this.map.getZoom();
    let level = 0;
    switch (zoom) {
      case 6: {
        //level = 3; //are 196 hexagons
        level = 4; //are 1359 hexagons
        //level = 5; //are 9528 hexagons
        //level = 6; //are 66686 hexagons
        //level = 7; //are 466779 hexagons
        //level = 8; //are 3267389 hexagons 
        break;
      }
      case 7: {
        //level = 4; //are 347 hexagons
        level = 5; //are 2446 hexagons
        //level = 6; //are 17117 hexagons
        //level = 7; //are 119743 hexagons
        //level = 8; //are 838212 hexagons
        break;
      }
      case 8: {
        level = 5; //are 626 hexagons
        //level = 6; //are 4372 hexagons
        //level = 7; //are 30601 hexagons
        //level = 8; //are 214196 hexagons 
        break;
      }
      case 9: {
        //level = 5; //are 162 hexagons
        level = 6; //are 1144 hexagons
        //level = 7; //are 8018 hexagons
        //level = 8; //are 56124 hexagons
        //level = 9; //are 392833 hexagons 
        break;
      }
      case 10: {
        //level = 6; //are 267 hexagons
        level = 7; //are 1874 hexagons
        //level = 8; //are 13093 hexagons
        //level = 9; //are 91651 hexagons 
        break;
      }
      case 11: {
        //level = 6; //are 92 hexagons
        level = 7; //are 653 hexagons
        //level = 8; //are 4571 hexagons
        //level = 9; //are 32003 hexagons 
        break;
      }
      case 12: {
        //level = 7; //are 220 hexagons
        level = 8; //are 1552 hexagons
        //level = 9; //are 10868 hexagons
        break;
      }
      case 13: {
        //level = 7; //are 90 hexagons
        //level = 8; //are 638 hexagons
        level = 9; //are 4471 hexagons
        break;
      }
      default: {
        if (zoom > 19) {
          level = 9;
        } else {
          level = 3;
        }
        break;
      }
    }
    return level; //zoom * this.hexbinZoomBase;
  }

}
