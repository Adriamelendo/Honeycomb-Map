import { Injectable } from '@angular/core';
// Use parse with typescript
import * as Parse from 'parse';
import { DatePipe } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Item {
  owner: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
  id: string;
  read: boolean;
}

export class LatLngItem extends Parse.Object {
  title: string;
  description: string;
  lat: number;
  lng: number;
  position: any;

  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('LatLngItem');
    // All other initialization
    this.title = 'My item title';
    this.description = "My item description";
    this.lat = 0;
    this.lng = 0;
    this.position = {
      "__type": "GeoPoint",
      "latitude": 56,
      "longitude": 99
    }
  }

  getShortTitle(): string {
    const length = 7;
    return this.title.substring(0, length);
  }

  static fill(title: string, description: string): LatLngItem {
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
  userPosition: Parse.GeoPoint = new Parse.GeoPoint(40.428122, -3.696058);
  public items: Item[] = [];
  itemsSubject = new BehaviorSubject(this.items);


  constructor(private datePipe: DatePipe) { }

  public setUserPosition(lat: number, lng: number) {
    this.userPosition.latitude = lat;
    this.userPosition.longitude = lng;
  }

  public getItemById(id: string): Item {
    return this.items.find(x => x.id === id);
  }
  
  private async getItemParseByIdFromBackend(id: string): Promise<Parse.Object<Parse.Attributes>> {
    let query = new Parse.Query('LatLngItem');
    const itemToReturn = await query.get(id);
    // if(itemToReturn === undefined) {}
    return itemToReturn;
  }
  async getItemByIdFromBackend(id: string): Promise<Item> {
    return this.fromParseToItem(await this.getItemParseByIdFromBackend(id));
  }

  getItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
    // return Parse.User.current().get('emailVerified');
    // this.authSubject.next(true);
  }

  private fromParseToItem(itemParse: Parse.Object<Parse.Attributes>): Item {
    return {
      owner: 'owner',
      title: itemParse.get('Title').replace('\\/', '/'),
      description: itemParse.get('Description').replace('\\/', '/'),
      lat: itemParse.get('Location').latitude,
      lng: itemParse.get('Location').longitude,
      date: this.datePipe.transform(itemParse.get('createdAt'), 'dd-MM-yyyy'),
      id: itemParse.id,
      read: false
    }
  }

  queryAllItems() {
    let query = new Parse.Query('LatLngItem');

    query.find().then(listItemsParse => {
      console.log('Items', listItemsParse);

      //replace all list
      this.items = listItemsParse.map(itemParse => this.fromParseToItem(itemParse));
      this.itemsSubject.next(this.items);

    }, err => {
      console.log('Error getting all items', err)
    })
  }

  queryItemsWithinGeoBox(north: number, east: number, south: number, west: number) {
    //Top Right Bottom Left
    var southwestOfGB = new Parse.GeoPoint(south, west);
    var northeastOfGB = new Parse.GeoPoint(north, east);

    var LatLngObject = Parse.Object.extend('LatLngItem');

    var query = new Parse.Query(LatLngObject);
    query.withinGeoBox("Location", southwestOfGB, northeastOfGB);
    query.find().then(listItemsParse => {
      listItemsParse.forEach(itemParse => {
        let current: Item = this.fromParseToItem(itemParse);
        this.items.push(current);
        console.log(this.items);
      });
      this.itemsSubject.next(this.items);
    }, err => {
      console.log('Error getting withinGeoBox', err);
    });
  }

  queryClosestItem() {
    let geoPoint = new Parse.GeoPoint(this.userPosition.latitude, this.userPosition.longitude);
    let query = new Parse.Query('LatLngItem');
    query.near('Location', geoPoint);
    query.limit(1);

    query.find().then(listItemsParse => {
      let itemParse = listItemsParse[0];
      console.log('Closest item', itemParse);

      let current: Item = this.fromParseToItem(itemParse);
      this.items.push(current);
      console.log(this.items);
      this.itemsSubject.next(this.items);
    }, err => {
      console.log('Error getting closest user', err);
    });
  }

  saveItem(item: Item) {
    const LatLngObject = Parse.Object.extend('LatLngItem');
    const itemToSave = new LatLngObject();

    itemToSave.set('Title', item.title);
    itemToSave.set('Description', item.title);
    itemToSave.set('Location', new Parse.GeoPoint(item.lat, item.lng));

    itemToSave.save()
      .then((itemParse) => {
        // Execute any logic that should take place after the object is saved.
        console.log('New object created with objectId: ' + itemParse.id);
      }, (error) => {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        console.log('Failed to create new object, with error code: ' + error.message);
      });
  }

  async refreshData(id: string) {
    const myObject = await this.getItemParseByIdFromBackend(id);
    if (!myObject.isDataAvailable()) {
      await myObject.fetch();
      this.items.push(this.fromParseToItem(myObject));
    }
  }



}
