import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { Item } from '../interfaces/item';
import { UnicodePipe } from '../pipes/unicode.pipe';

// Use parse with typescript
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private ls = true; //localstorage
  private userPosition: Parse.GeoPoint = new Parse.GeoPoint(40.428122, -3.696058);
  private items: Item[] = [];
  private itemsParse: Parse.Object<Parse.Attributes>[] = [];
  public itemsSubject = new BehaviorSubject(this.items);

  constructor(
    private datePipe: DatePipe,
    private unicodePipe: UnicodePipe
  ) {
    if (this.ls) Parse.enableLocalDatastore();
  }

  public setUserPosition(lat: number, lng: number) {
    this.userPosition.latitude = lat;
    this.userPosition.longitude = lng;
  }

  public getItemById(id: string): Item {
    return this.items.find(x => x.id === id);
  }
  public getIndexById(id: string): number {
    return this.items.findIndex(x => x.id === id);
  }

  private async getItemParseByIdFromBackend(id: string): Promise<Parse.Object<Parse.Attributes>> {
    let query = new Parse.Query('LatLngItem');
    if (this.ls) { query.fromLocalDatastore(); }
    let itemToReturn = await query.get(id);
    if (itemToReturn !== undefined) {
      console.log('item undefined in local storage');
      if (this.ls) {
        query.fromNetwork();
        itemToReturn = await query.get(id);
        itemToReturn.pin();
      }
    }
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
      // title: this.unicodePipe.transform(itemParse.get('Title')),
      // description: this.unicodePipe.transform(itemParse.get('Description')),
      title: itemParse.get('Title'),
      description: itemParse.get('Description'),
      lat: itemParse.get('Location').latitude,
      lng: itemParse.get('Location').longitude,
      date: this.datePipe.transform(itemParse.get('createdAt'), 'dd-MM-yyyy'),
      id: itemParse.id,
      read: false
    }
  }
  private fillParseWithItem(itemParse: Parse.Object<Parse.Attributes>, item: Item) {
    itemParse.set('Title', item.title);
    itemParse.set('Description', item.title);
    itemParse.set('Location', new Parse.GeoPoint(item.lat, item.lng));
  }
  private replaceAllItems(listItemsParse: Parse.Object<Parse.Attributes>[]) {
    console.log('Items', listItemsParse);
    this.itemsParse = listItemsParse;
    //replace all list
    this.items = this.itemsParse.map(itemParse => this.fromParseToItem(itemParse));
    this.itemsSubject.next(this.items);
  }
  private addItemsToEnd(listItemsParse: Parse.Object<Parse.Attributes>[]) {
    listItemsParse.forEach(itemParse => {
      this.itemsParse.push(itemParse);
      let current: Item = this.fromParseToItem(itemParse);
      while (this.getItemById(current.id) !== undefined) {
        current.id = current.id + 'bis';
        current.title = 'I ' + current.title;
      }
      this.items.push(current);
      console.log(this.items);
    });
    this.itemsSubject.next(this.items);
  }

  queryMoreThan100(query: Parse.Query, skip: number = 0):Promise<any> {
    query.limit(1000); //1000 is the mmaximum, by default is 100
    query.skip(skip);

    return query.find().then(listItemsParse=> {
      //console.log('START' + results);
      if(skip==0){
        this.replaceAllItems(listItemsParse);
      } else {
        this.addItemsToEnd(listItemsParse);
      }
      skip += listItemsParse.length;
      
      if (listItemsParse.length >= 1000) {
        return this.queryMoreThan100(query, skip);
      }
    }, err => {
      console.log('Error getting all items', err)
    });
  }


  queryAllItems() {
    let query = new Parse.Query('LatLngItem');
    if (this.ls) { query.fromLocalDatastore(); }
    this.queryMoreThan100(query);
    // query.find().then(listItemsParse => {
    //   this.replaceAllItems(listItemsParse);
    // }, err => {
    //   console.log('Error getting all items', err)
    // });
  }
  forceQueryFromRemoteAllItems() {
    let query = new Parse.Query('LatLngItem');
    this.queryMoreThan100(query).then(() =>{
      Parse.Object.pinAll(this.itemsParse);
    });
    // query.find().then(listItemsParse => {
    //   Parse.Object.pinAll(listItemsParse);
    //   // listItemsParse.forEach(it=>it.pin());
    //   this.replaceAllItems(listItemsParse);
    // }, err => {
    //   console.log('Error getting all items', err)
    // });
  }
  forceCleanLocalStorage() {
    Parse.Object.unPinAllObjects().then(() => {
      this.replaceAllItems([]);
    });
  }

  queryItemsWithinGeoBox(north: number, east: number, south: number, west: number) {
    //Top Right Bottom Left
    var southwestOfGB = new Parse.GeoPoint(south, west);
    var northeastOfGB = new Parse.GeoPoint(north, east);

    var query = new Parse.Query('LatLngItem');
    if (this.ls) { query.fromLocalDatastore(); }
    //if(this.ls) { query.fromPin(); }
    query.withinGeoBox("Location", southwestOfGB, northeastOfGB);
    query.find().then(listItemsParse => {
      //this.addItemsToEnd(listItemsParse);
      this.replaceAllItems(listItemsParse);
    }, err => {
      console.log('Error getting withinGeoBox', err);
    });
  }

  seedyFixToFindTheClosestInLocal(geoPoint: Parse.GeoPoint, distance: number = 1) {
    // we look for the points within a radius, and we increase the radius   
    let query = new Parse.Query('LatLngItem');
    query.fromLocalDatastore();
    query.withinKilometers("Location", geoPoint, distance);
    query.limit(1);

    query.find().then(listItemsParse => {
      if ((listItemsParse.length == 0) && distance < 100) {
        this.seedyFixToFindTheClosestInLocal(geoPoint, distance + 1);
      } else {
        this.replaceAllItems(listItemsParse);
      }
    }, err => {
      console.log('Error getting closest user', err);
    });
  }

  queryClosestItem() {
    let geoPoint = new Parse.GeoPoint(this.userPosition.latitude, this.userPosition.longitude);
    console.log('geoPoint: ', geoPoint);
    if (this.ls) {
      this.seedyFixToFindTheClosestInLocal(geoPoint);
    } else {
      let query = new Parse.Query('LatLngItem');
      query.near('Location', geoPoint);
      query.limit(1);

      query.find().then(listItemsParse => {
        //this.addItemsToEnd(listItemsParse);
        this.replaceAllItems(listItemsParse);
      }, err => {
        console.log('Error getting closest user', err);
      });
    }
  }

  saveItem(item: Item) {
    const LatLngObject = Parse.Object.extend('LatLngItem');
    const itemToSave = new LatLngObject();

    this.fillParseWithItem(itemToSave, item);

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
    const idx = this.getIndexById(id);
    const myObject = this.itemsParse[idx];
    if (!myObject.isDataAvailable()) {
      await myObject.fetch();
      this.items[idx] = this.fromParseToItem(myObject);
    }
  }
  updateData(item: Item) {
    const idx = this.getIndexById(item.id);
    this.items[idx] = item;
    const myObject = this.itemsParse[idx];
    this.fillParseWithItem(myObject, item);
    myObject.save();
  }
  destroyData(id: string) {
    const idx = this.getIndexById(id);
    const myObject = this.itemsParse[idx];
    myObject.destroy().then((myObject) => {
      // The object was deleted from the Parse Cloud.
      this.items.splice(idx, 1);
      this.itemsParse.splice(idx, 1);
    }, (error) => {
      // The delete failed.
      // error is a Parse.Error with an error code and message.
    });
  }



}
