import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as L from 'leaflet';
import * as geojson2h3 from 'geojson2h3';
import * as h3 from 'h3-js';
import * as latinize from 'latinize';

import rawResources from '../../assets/data/resources.json';
import rawRegions from '../../assets/data/regions.json';

export interface HCMapRegion {
  id: string;
  name: string;
  type: 'province' | 'town';
  boundary: geojson2h3.GeoJsonObject;  // GeoJSON shape of the region borders at the given hexLevel
  inside: geojson2h3.GeoJsonObject;    // GeoJSON shape of the inside hexes at the given hexLevel
  resources: HCMapResource[];
}

export interface HCMapResource {
  id: number;
  title: string;
  description: string;
  category: string;
  hex: string;
  level: number;
  regionId?: string;
  outline: geojson2h3.GeoJsonObject;   // GeoJSON shape of the containing hex at the given hexLevel
}

export type MapData = [HCMapRegion[], HCMapResource[]];

export interface HexContents {
  regions: HCMapRegion[];
  resources: HCMapResource[];
}


@Injectable({
  providedIn: 'root'
})
export class HCMapDataService {

  public mapData: Subject<MapData> = new Subject<MapData>();

  private regionsById: Map<string, HCMapRegion>;
  private contentsByHex: Map<string, HexContents>;

  /* Recalculate all mapData in the new viewport */
  public setViewport(
    bounds: L.LatLngBounds,
    zoom: number,
    category: string,
    searchText: string,
  ) {
    const hexLevel = this.getHexLevel(zoom);
    const extBounds = this.extendBounds(hexLevel, bounds);

    console.log('Map zoom:', zoom);
    console.log('Hex level:', hexLevel);
    console.log('Category:', category);
    console.log('Search text:', searchText);

    this.regionsById = new Map<string, HCMapRegion>();
    this.contentsByHex = new Map<string, HexContents>();

    const regions = this.getRegions(extBounds, hexLevel);
    const resources = this.getResources(extBounds, hexLevel, category, searchText);

    this.mapData.next([regions, resources]);
  }

  /* Search one particular resource */
  public getResourceById(id: number): HCMapResource | undefined {
    const hexLevels = Object.keys(rawRegions);
    const levelRawResources = (hexLevels.length > 0) ? 
      rawResources[hexLevels[0]] :
      [];
    const rawResource = levelRawResources.find(r => r.id === id);
    if (!rawResource) {
      return undefined;
    } else {
      return this.makeResource(rawResource);
    }
  }

  /* Get all contents at a given hex */
  public getContentsAtHex(hex: string) {
    return this.contentsByHex[hex];
  }

  /* Enlarge bounds to fit one hexagon more at each border, at the given hexLevel */
  private extendBounds(hexLevel: number, bounds: L.LatLngBounds): L.LatLngBounds {
    const meters = h3.edgeLength(hexLevel, 'm');

    // aprox 1km in degree = 1 / 111.32km = 0.0089
    // 1m in degree = 0.0089 / 1000 = 0.0000089
    // pi / 180 = 0.018
    const delta = meters * 1.5 * 0.0000089;

    const northEast = this.extendBoundsCorner(bounds.getNorthEast(), delta);
    const southWest = this.extendBoundsCorner(bounds.getSouthWest(), -delta);

    return L.latLngBounds([northEast, southWest]);
  }

  private extendBoundsCorner(coords: L.LatLng, delta: number): L.LatLng {
    const newLat = coords.lat + delta;
    const newLng = coords.lng + delta / Math.cos(coords.lat * 0.018);
    return L.latLng(newLat, newLng);
  }

  /*
   * Extract the regions that intersect with the given bounds, and generate
   * their GeoJSON shape at the given hexLevel.
   */
  private getRegions(bounds: L.LatLngBounds, hexLevel: number): HCMapRegion[] {
    const levelRawRegions = rawRegions[hexLevel] || [];
    return levelRawRegions.filter(
      (rawRegion) => this.intersectsWithBounds(rawRegion.container, bounds)
    ).map(
      (rawRegion) => {
        const region = this.makeRegion(rawRegion);
        this.indexRegion(rawRegion.hexes, region);
        return region;
      }
    );
  }

  private intersectsWithBounds(container: any, bounds: L.LatLngBounds) {
    return (
      container.east >= bounds.getWest() &&
      container.west <= bounds.getEast() &&
      container.north >= bounds.getSouth() &&
      container.south <= bounds.getNorth()
    );
  }

  private makeRegion(rawRegion: any): HCMapRegion {
    return {
      id: rawRegion.id,
      name: rawRegion.name,
      type: rawRegion.type,
      boundary: geojson2h3.h3SetToFeature(rawRegion.hexes),
      inside: (rawRegion.type === 'town') ?
        geojson2h3.h3SetToMultiPolygonFeature(rawRegion.hexes) :
        undefined,
      resources: [],
    }
  }

  private indexRegion(hexes: string[], region: HCMapRegion) {
    hexes.forEach((hex) => {
      this.allocateContents(hex);
      this.contentsByHex[hex].regions.push(region);
    });
    this.regionsById[region.id] = region;
  }

  /*
   * Extract resources that fit inside the given bounds, and generate their GeoJSON shape
   * at the given hexLevel.
   */
  private getResources(
    bounds: L.LatLngBounds,
    hexLevel: number,
    category: string,
    searchText: string,
  ): HCMapResource[] {
    const levelRawResources = rawResources[hexLevel] || [];
    return levelRawResources.filter(
      (rawResource) => (this.matchesCategory(rawResource, category) &&
                        this.matchesSearch(rawResource, searchText))
    ).map(
      (rawResource) => {
        const resource = this.makeResource(rawResource);
        this.indexResource(rawResource.hex, resource);
        return resource;
      }
    );
  }

  private matchesCategory(rawResource: any, category: string) {
    return (category === '') || (rawResource.category === category);
  }

  private matchesSearch(rawResource: any, searchText: string) {
    if (searchText === '') {
      return true;
    }
    const content = rawResource.title + ' ' + rawResource.description;
    const normalizedContent = latinize(content).toLowerCase().trim();
    const normalizedSearchText = latinize(searchText).toLowerCase().trim();
    return normalizedContent.indexOf(normalizedSearchText) >= 0;
  }

  private makeResource(rawResource: any): HCMapResource {
    return {
      id: rawResource.id,
      title: rawResource.title,
      description: rawResource.description,
      category: rawResource.category,
      hex: rawResource.hex,
      level: rawResource.level,
      outline: geojson2h3.h3ToFeature(rawResource.hex),
      regionId: rawResource.regionId,
    };
  }

  private indexResource(hex: string, resource: HCMapResource) {
    this.allocateContents(hex);
    this.contentsByHex[hex].resources.push(resource);

    if (resource.regionId) {
      const region = this.regionsById[resource.regionId];
      if (region) {
        region.resources.push(resource);
      }
    }
  }

  private allocateContents(hex) {
    if (!this.contentsByHex[hex]) {
      this.contentsByHex[hex] = {
        regions: [],
        resources: [],
      };
    }
  }

  /* Calculate the hex level that corresponds to a map zoom level */
  public getHexLevel(zoom: number) {
    let hexLevel = 0;
    switch (zoom) {
      case 6: {
        // hexLevel = 3; // are 196 hexagons
        hexLevel = 4; // are 1359 hexagons
        // hexLevel = 5; // are 9528 hexagons
        // hexLevel = 6; // are 66686 hexagons
        // hexLevel = 7; // are 466779 hexagons
        // hexLevel = 8; // are 3267389 hexagons
        break;
      }
      case 7: {
        // hexLevel = 4; // are 347 hexagons
        hexLevel = 5; // are 2446 hexagons
        // hexLevel = 6; // are 17117 hexagons
        // hexLevel = 7; // are 119743 hexagons
        // hexLevel = 8; // are 838212 hexagons
        break;
      }
      case 8: {
        hexLevel = 5; // are 626 hexagons
        // hexLevel = 6; // are 4372 hexagons
        // hexLevel = 7; // are 30601 hexagons
        // hexLevel = 8; // are 214196 hexagons
        break;
      }
      case 9: {
        // hexLevel = 5; // are 162 hexagons
        hexLevel = 6; // are 1144 hexagons
        // hexLevel = 7; // are 8018 hexagons
        // hexLevel = 8; // are 56124 hexagons
        // hexLevel = 9; // are 392833 hexagons
        break;
      }
      case 10: {
        // hexLevel = 6; // are 267 hexagons
        hexLevel = 7; // are 1874 hexagons
        // hexLevel = 8; // are 13093 hexagons
        // hexLevel = 9; // are 91651 hexagons
        break;
      }
      case 11: {
        // hexLevel = 6; // are 92 hexagons
        hexLevel = 7; // are 653 hexagons
        // hexLevel = 8; // are 4571 hexagons
        // hexLevel = 9; // are 32003 hexagons
        break;
      }
      case 12: {
        // hexLevel = 7; // are 220 hexagons
        hexLevel = 8; // are 1552 hexagons
        // hexLevel = 9; // are 10868 hexagons
        break;
      }
      case 13: {
        // hexLevel = 7; // are 90 hexagons
        hexLevel = 8; // are 638 hexagons
        // hexLevel = 9; // are 4471 hexagons
        break;
      }
      default: {
        if (zoom >= 6) {
          hexLevel = 8;
        } else {
          hexLevel = 4;
        }
        break;
      }
    }

    return hexLevel; // MapZoom * 0,66666;
  }
}
