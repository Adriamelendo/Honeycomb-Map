import { Injectable } from '@angular/core';
// Use parse with typescript
import * as Parse from 'parse';

export interface Item {
  fromName: string;
  subject: string;
  date: string;
  id: number;
  read: boolean;
}

export class LatLngItem extends Parse.Object {
  title:string;
  description:string;
  lat:number;
  lng:number;
  position:any;
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('LatLngItem');
    // All other initialization
    this.title = 'My item title';
    this.description = "My item description";
    this.lat = 0;
    this.lng = 0;
    this.position={
      "__type": "GeoPoint",
      "latitude": 56,
      "longitude": 99
    }
  }

  getShortTitle():string {
    const length = 7;
    return this.title.substring(0, length);
  }

  static fill(title: string, description: string):LatLngItem {
    const latLngItem = new LatLngItem();
    latLngItem.set('title', title);
    latLngItem.set('description', description);
    return latLngItem;
  }
}
// After specifying the LatLngItem subclass...
Parse.Object.registerSubclass('LatLngItem', LatLngItem);



@Injectable({
  providedIn: 'root'
})
export class DataService {
  public items: Item[] = [
    {
      fromName: 'Matt Chorsey',
      subject: 'New event: Trip to Vegas',
      date: '9:32 AM',
      id: 0,
      read: false
    },
    {
      fromName: 'Lauren Ruthford',
      subject: 'Long time no chat',
      date: '6:12 AM',
      id: 1,
      read: false
    },
    {
      fromName: 'Jordan Firth',
      subject: 'Report Results',
      date: '4:55 AM',
      id: 2,
      read: false
    },
    {
      fromName: 'Bill Thomas',
      subject: 'The situation',
      date: 'Yesterday',
      id: 3,
      read: false
    },
    {
      fromName: 'Joanne Pollan',
      subject: 'Updated invitation: Swim lessons',
      date: 'Yesterday',
      id: 4,
      read: false
    },
    {
      fromName: 'Andrea Cornerston',
      subject: 'Last minute ask',
      date: 'Yesterday',
      id: 5,
      read: false
    },
    {
      fromName: 'Moe Chamont',
      subject: 'Family Calendar - Version 1',
      date: 'Last Week',
      id: 6,
      read: false
    },
    {
      fromName: 'Kelly Richardson',
      subject: 'Placeholder Headhots',
      date: 'Last Week',
      id: 7,
      read: false
    }
  ];

  constructor() { }

  public getItems(): Item[] {
    return this.items;
  }

  // async getItemsWithinGeoBox(north:number,east:number,south:number,west:number): Item[] {
  //   //Top Right Bottom Left
  //   var southwestOfGB = new Parse.GeoPoint(south, west);
  //   var northeastOfGB = new Parse.GeoPoint(north, east);

  //   var PlaceObject = Parse.Object.extend("PlaceObject");

  //   var query = new Parse.Query(PlaceObject);
  //   query.withinGeoBox("location", southwestOfGB, northeastOfGB);
  //   const PlacesInGB = await query.find();
  //   console.log(PlacesInGB);
  //   // return PlacesInGB;
  //   return;
  // }

  public getItemById(id: number): Item {
    return this.items[id];
  }
}
