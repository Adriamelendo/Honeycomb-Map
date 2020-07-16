import { Component, OnChanges, OnInit, Input, HostListener } from '@angular/core';
import { HexContents, HCMapRegion, HCMapResource } from '../../services/hcmap-data.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnChanges, OnInit {

  @Input() hexContents: HexContents;
  
  public towns: HCMapRegion[];
  public provinces: HCMapRegion[];
  public resources: HCMapResource[];

  biggerThan680: boolean = false;

  slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  constructor(public platform: Platform) {}
  
  ngOnInit() {
    console.log(this.platform.width());
    if (this.platform.width() > 680) {
      this.biggerThan680 = true;
    } else {
      this.biggerThan680 = false;
    }
  }

  @HostListener('window:resize', ['$event'])onResize(event) {
    console.log(this.platform.width());
    if (this.platform.width() > 680) {
      this.biggerThan680 = true;
    } else {
      this.biggerThan680 = false;
    }
  }

  ngOnChanges() {
    console.log('HexContents');

    if (this.hexContents) {
      this.towns = this.hexContents.regions.filter(
        (region) => (region.type === 'town' &&
          region.resources.length > 0)
      );
      this.provinces = this.hexContents.regions.filter(
        (region) => (region.type === 'province' &&
          region.resources.length > 0)
      );
      this.resources = this.hexContents.resources;
    } else {
      this.towns = [];
      this.provinces = [];
      this.resources = [];
    }

    console.log('towns:', this.towns);
    console.log('provinces:', this.towns);
    console.log('resources:', this.resources);
  }

  public hasTowns() {
    return (this.towns.length > 0);
  }

  public hasProvinces() {
    return (this.provinces.length > 0);
  }

  public hasResources() {
    return (this.resources.length > 0);
  }

  public resourcesClass() {
    let position;
    if (!this.hasTowns() && !this.hasProvinces()) {
      position = 'unique-panel';
    } else if (this.hasTowns() && this.hasProvinces()) {
      position = 'first-panel';
    } else {
      position = 'second-upper-panel';
    }
    return 'right-panel ' + position;
  }

  public townsClass() {
    let position;
    if (!this.hasResources() && !this.hasProvinces()) {
      position = 'unique-panel';
    } else if (this.hasResources() && !this.hasProvinces()) {
      position = 'second-lower-panel';
    } else {
      position = 'second-upper-panel';
    }
    return 'right-panel ' + position;
  }

  public provincesClass() {
    let position;
    if (!this.hasResources() && !this.hasTowns()) {
      position = 'unique-panel';
    } else {
      position = 'second-lower-panel';
    }
    return 'right-panel ' + position;
  }
}
