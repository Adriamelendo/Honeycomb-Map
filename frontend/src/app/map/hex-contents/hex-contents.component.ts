import { Component, OnChanges, Input } from '@angular/core';
import { HCMapRegion, HexContents } from '../../services/hcmap-data.service';

@Component({
  selector: 'app-hex-contents',
  templateUrl: './hex-contents.component.html',
  styleUrls: ['./hex-contents.component.scss'],
})
export class HexContentsComponent implements OnChanges {

  @Input() hexContents: HexContents;
  @Input() isOpen: boolean = false;
  towns: HCMapRegion[] = [];
  provinces: HCMapRegion[] = [];


  constructor() { }

  ngOnChanges() {
    console.log('HexContents');
    if (this.hexContents) {
      console.log('regions:', this.hexContents.regions);
      console.log('resources:', this.hexContents.resources);

      this.towns = [];
      this.provinces = [];

      this.hexContents.regions.forEach(reg => {
        if (reg.resources.length !== 0) {
          if (reg.type === 'town') {
            this.towns.push(reg);
          }
          if (reg.type === 'province') {
            this.provinces.push(reg);
          }
        }
      });

    } else {
      console.log('empty');
    }

  }

}
